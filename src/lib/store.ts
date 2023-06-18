import { syncedStore, getYjsDoc } from '@syncedstore/core';
import { WebrtcProvider } from 'y-webrtc';
import { svelteSyncedStore } from '@syncedstore/svelte';
import type { ExpressionState } from 'desmos';

const urlSearchParams = new URLSearchParams(location.search);

function makeId(length: number) {
    let result = '';

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    
    let counter = 0;

    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }

    return result;
}

export const storeId = urlSearchParams.has("join-id") ? urlSearchParams.get("join-id") : makeId(6);
export const store = syncedStore({ expressions: new Array<ExpressionState>() });
export const svelteStore = svelteSyncedStore(store);

const doc = getYjsDoc(store);

export const provider = new WebrtcProvider(`equation-${storeId}`, doc, {
    signaling: ["wss://signal-us-east-1d.xacer.dev:443"]
});

export const connect = () => provider.connect();
export const disconnect = () => provider.disconnect();

export const inviteLink = urlSearchParams.has("join-id") ? window.location.toString() : window.location + `?join-id=${storeId}`;