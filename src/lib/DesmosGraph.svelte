<script lang="ts">

    import { onMount } from 'svelte';
    import Desmos, { type ExpressionState } from 'desmos';
    import * as Y from 'yjs';
    import { WebrtcProvider } from 'y-webrtc';
    import { makeId, objectEquals, createNickname } from './helper';
    import { writable } from 'svelte/store';

    type UserMetadata = ReturnType<typeof createNickname>;

    let calculator: Desmos.Calculator;
    let divEle: HTMLDivElement;

    let { imageUrl, colorGroup } = createNickname();

    let inviteLink: string;

    let nameStore = writable<UserMetadata[]>([]);

    onMount(() => {

        const ydoc = new Y.Doc();

        const urlSearchParams = new URLSearchParams(location.search);
        const roomId = urlSearchParams.has("id") ? urlSearchParams.get("id") : makeId(6);

        inviteLink = `${window.location.toString().split("?")[0]}?id=${roomId}`;
        
        const provider = new WebrtcProvider(`desmos-${roomId}`, ydoc, {
            signaling: [ "wss://signal-us-east-1d.xacer.dev:443" ]
        });

        provider.awareness.setLocalStateField("user", {
            imageUrl, colorGroup
        });

        provider.connect();

        provider.awareness.on('change', () => {
            nameStore.update(_ => Array.from(provider.awareness.getStates().values()).map(u => u.user).slice(1) as UserMetadata[]);
        });
        
        const yarr = ydoc.getArray<ExpressionState>("equations");
        const nameList = ydoc.getArray<UserMetadata>("name-list");

        nameList.push([{ imageUrl, colorGroup }]);

        nameList.observe(() => {
            let names = nameList.toArray();
            nameStore.update(_ => {
                return names.filter(u => {
                    return !objectEquals(u, { imageUrl, colorGroup });
                });
            });
        });

        calculator = Desmos.GraphingCalculator(divEle, {
            autosize: true,
            images: false,
            folders: false,
            projectorMode: false,
            notes: true
        });

        let pastExpressions = calculator.getExpressions();

        yarr.observe(() => {
            let newExpressions = yarr.toArray();
            let curExpressions = calculator.getExpressions();

            // delete removed expressions
            calculator.removeExpressions(curExpressions.filter(u => {
                return !newExpressions.find(v => v.id == u.id);
            }).map(e => {
                return { id: e.id as string };
            }));

            // add remaining
            calculator.setExpressions(newExpressions);
            
            // update cache
            pastExpressions = newExpressions;
        });

        setInterval(() => {

            let newExpressions = calculator.getExpressions();

            // Look for new expressions
            let inserts = newExpressions.filter(u => {
                return !pastExpressions.find(v => u.id == v.id);
            });

            let changes = newExpressions.filter(expr => {
                let pastExpr = pastExpressions.find(v => expr.id == v.id);
                if (!objectEquals(expr, pastExpr)) {
                    return true;
                }
            });

            let deletes = pastExpressions.filter(v => {
                return !newExpressions.find(u => u.id == v.id);
            });

            // Don't use objectEquals here


            if (!objectEquals(newExpressions, pastExpressions)) {
                console.log("change");
                // encode document as single update
                ydoc.transact(() => {
                    yarr.delete(0, yarr.length);
                    yarr.insert(0, newExpressions);
                });
                pastExpressions = newExpressions;
            }

        }, 1000 / 60);

        
    });

    export function setExpressions (expressions: ExpressionState[]) {
        calculator.setExpressions(expressions);
    }

</script>

<main>
    <section>
        
        <span class="color-icon yours" style="background-image:url({imageUrl});border-color:{colorGroup.color}"></span>
            
        
        {#each $nameStore as meta}
        <span class="color-icon" style="background-image:url({meta.imageUrl});border-color:{meta.colorGroup.color}"></span>
        {/each}

        {#if inviteLink}
            <button class="invite-link" on:click={()=>window.navigator.clipboard.writeText(inviteLink)}>
                Copy Invite<br>Link
            </button>
        {/if}

    </section>

    <div
        id="desmos-graph"
        bind:this={divEle}
    />
</main>


<style>
    main {
        overflow: hidden;
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: 65px auto;
        position: absolute;
        width: 100vw;
        height: 100vh;
    }
    
    section {
        grid-row: 1;
        background-color: rgb(42, 42, 42);
        display: flex;
        place-items: center;
        padding-left: 15px;
    }

    #desmos-graph {
        grid-row: 2;
        width: 100%;
        height: 100%;
    }

    .color-icon {
        width: 45px;
        height: 45px;
        padding: 0;
        margin-right: 5px;
        margin-left: 5px;
        border: 5px solid red;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        border-radius: 50%;
    }

    .yours {
        margin-right: 10px;
    }

    .invite-link {
        color: white;
        right: 5px;
    }
    
    span {
        padding: 5px;
        display: inline-block;
    }

    button {
        background: none;
        border: none;
        cursor: pointer;
        border: 1px solid red;
        position: absolute;
        float: right;
        height: 100%;
    }
</style>

