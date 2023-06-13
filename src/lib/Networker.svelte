<script lang="ts" context="module">
    import type { DataConnection } from 'peerjs';
    import { getContext } from "svelte";

    export type NetworkEvent<Key extends string, Payload> = {
        key: Key,
        payload: Payload
    };

    type Message = {
        key: string,
        payload: any,
        from: string
    };

    interface Handler<T> {
        (payload: T): void;
    }

    type HandlerList =  Array<Handler<any>>;
    type HandlerMap = Map<string, HandlerList>;
    type Handlers = Map<string, HandlerMap>;
    type GlobalHandlers = HandlerMap;

    type Payload<U extends AnyUpdate> = U["payload"];
    type Key<U extends AnyUpdate> = U["key"];
    
    export interface NetworkManager {

        addHandler<U extends AnyUpdate>(peerId: string, key: Key<U>, handler: Handler<Payload<U>>): void;
        removeHandler<U extends AnyUpdate>(peerId: string, key: Key<U>, handler: Handler<Payload<U>>): void;
        addGlobalHandler<U extends AnyUpdate>(key: Key<U>, handler: Handler<Payload<U>>): void;
        removeGlobalHandler<U extends AnyUpdate>(key: Key<U>, handler: Handler<Payload<U>>): void;
        disconnectFrom(peerId: string): void;
        addDataConnection(peerId: string, connection: DataConnection): void;
        connectTo(peerId: string): void;
        broadcast<U extends AnyUpdate>(key: Key<U>, payload: Payload<U>): void;
        broadcastLimited<U extends AnyUpdate>(key: Key<U>, payload: Payload<U>, ids: string[]): void;
        broadcastSingle<U extends AnyUpdate>(key: Key<U>, payload: Payload<U>, id: string): void;
        usePeerId(): string | undefined;
        usePeerList(): Writable<string[]>;
        usePeerNames(): Writable<Map<string, string>>;
        useJoinLink(): string;
    }

    type Vector3 = { x: number, y: number, z: number };
    type Quaternion = { x: number, y: number, z: number, w: number };

    export type Update<K extends string, P> = { key: K, payload: P };

    export type AnyUpdate = Update<any, any>

    export type PositionUpdate = Update<"position-update", {
        position: Vector3,
        rotation: Quaternion,
        velocity: Vector3
    }>;

    export type UserListUpdate = Update<"user-list", string[]>;

    export type PingUpdate = Update<"ping", string>;

    export type NameUpdate = Update<"name", {
        from: string,
        name: string
    }>;

    export function useNetworker() {
        return getContext("networker") as NetworkManager;
    }

    export function setNetworker(networker: NetworkManager) {
        setContext("networker", networker);
    }
</script>

<script lang="ts">

    import Peer from 'peerjs';
    import { writable, type Writable } from 'svelte/store';
    import { setContext } from 'svelte';

    const client: Peer = new Peer();

    const dataConnections = new Map<string, DataConnection>();

    const handlers: Handlers = new Map();
    const globalHandlers: GlobalHandlers = new Map();

    const peerList = writable<string[]>([]);
    const peerNames = writable(new Map<string, string>());
    
    const name = getContext<Writable<string>>("player-name");

    export const networker: NetworkManager = {
        addHandler(peerId, key, handler) {
            if (!handlers.has(peerId)) handlers.set(peerId, new Map());
            if (!handlers.get(peerId)?.has(key)) handlers.get(peerId)?.set(key, []);
            handlers.get(peerId)?.get(key)?.push(handler);
        },

        removeHandler(peerId, key, handler) {
            if (!handlers.has(peerId)) handlers.set(peerId, new Map());
            if (!handlers.get(peerId)?.has(key)) handlers.get(peerId)?.set(key, []);

            let index = handlers.get(peerId)?.get(key)?.indexOf(handler) as number;

            if (index > -1) handlers.get(peerId)?.get(key)?.splice(index, 1);
        },

        addGlobalHandler(key, handler) {
            if (!globalHandlers.has(key)) globalHandlers.set(key, []);
            globalHandlers.get(key)?.push(handler);
        },

        removeGlobalHandler(key, handler) {
            if (!globalHandlers.has(key)) globalHandlers.set(key, []);

            let index = globalHandlers.get(key)?.indexOf(handler) as number;
            globalHandlers.get(key)?.splice(index, 1);
        },

        disconnectFrom(peerId) {
            console.log("Disconnecting from", peerId);

            dataConnections.get(peerId)?.close();
            dataConnections.delete(peerId);

            peerNames.update(map => {
                map.delete(peerId);
                return map;
            });

            peerList.update(currentPeerList => currentPeerList.filter(id => id != peerId));
        },

        addDataConnection(peerId, connection) {
            if (dataConnections.has(peerId)) return;

            dataConnections.set(peerId, connection);

            dataConnections.get(peerId)?.on("data", data => {
                let message = data as Message;

                // Invoke handlers
                handlers.get(peerId)?.get(message.key)?.forEach(handler => {
                    handler(message.payload);
                });

                // Invoke global handlers
                globalHandlers.get(message.key)?.forEach(handler => handler(message.payload));
            });

            dataConnections.get(peerId)?.on("close", () => {
                this.disconnectFrom(peerId);
            });

            peerList.update(currentPeerList => [...currentPeerList, peerId]);
        },

        connectTo(peerId) {
            if (!client.id) return;
            if (peerId == client.id) return;
            if (dataConnections.has(peerId)) return;

            const connection = client.connect(peerId);
            connection.on("open", () => this.addDataConnection(peerId, connection));
        },

        broadcast(key, payload) {
            if (!client.id) return;

            let message: Message = { key, payload, from: client.id };

            dataConnections.forEach(connection => connection.send(message));
        },

        broadcastLimited(key, payload, ids) {
            if (!client.id) return;

            ids.forEach(id => this.broadcastSingle(key, payload, id));
        },

        broadcastSingle(key, payload, id) {
            if (!client.id) return;

            let message: Message = { key, payload, from: client.id };

            dataConnections.get(id)?.send(message);
        },

        usePeerId() { return client.id; },
        usePeerList() { return peerList; },
        usePeerNames() { return peerNames; },

        useJoinLink() {
            return `${window.location}?join-id=${client.id}`;
        }
    };

    /** Either initialize as "Learner" or "Tutor" */
    const urlSearchParams = new URLSearchParams(location.search);
    const isLearner = urlSearchParams.has("join-id");
    client.on("open", _ => {
        if (isLearner) {
            networker.connectTo(urlSearchParams.get("join-id") as string);
        } else {
            // This happens ONLY for the tutor
            // Other learners will not take action upon
            // a new connection
            client.on("connection", connection => {
                networker.addDataConnection(connection.peer, connection);

                if (connection.open) {
                    connection.send({
                        key: "user-list",
                        from: client.id,
                        payload: [...dataConnections.keys()]
                    } as Message);
                } else {
                    connection.on("open", () => {
                        connection.send({
                            key: "user-list",
                            from: client.id,
                            payload: [...dataConnections.keys()]
                        } as Message);
                    });
                }
            });
        }
    });

    client.on("connection", connection => {
        networker.addDataConnection(connection.peer, connection);        
    });

    /** When we get a new user-list, try to connect to each user */
    networker.addGlobalHandler<UserListUpdate>("user-list", userList => {
        userList.forEach(networker.connectTo);
    });

    networker.addGlobalHandler<NameUpdate>("name", ({ from, name }) => {
        peerNames.update(map => map.set(from, name));
    });

    
    let peerPingCounter = new Map<string, number>();
    let maxPeerPingCount = 30;
    
    networker.addGlobalHandler<PingUpdate>("ping", peerId => {
        peerPingCounter.set(peerId, 0);
    });

    setInterval(() => {
        networker.broadcast<PingUpdate>("ping", client.id);
        networker.broadcast<NameUpdate>("name", { from: client.id, name: $name });

        // Enforce ping rules
        peerPingCounter.forEach((pingCount, peerId, map) => {
            map.set(peerId, pingCount + 1);

            if (pingCount > maxPeerPingCount) {
                networker.disconnectFrom(peerId);
                map.delete(peerId);
            }
        });
    }, 1_000);


    setNetworker(networker);

</script>

<slot {networker}/>