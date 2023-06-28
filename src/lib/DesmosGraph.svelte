<script lang="ts">

    // TODO:
    // - Allow annotatons
    // - Style button link

    import { onMount } from 'svelte';
    import * as Y from 'yjs';
    import { WebrtcProvider } from 'y-webrtc';
    import { makeId, objectEquals, createUserMetadata, areExpressionsEqual } from './helper';
    import { writable } from 'svelte/store';

    type UserMetadata = ReturnType<typeof createUserMetadata>;

    type ExpressionState = Desmos.ExpressionState;
    type Calculator = Desmos.Calculator;
    
    const POLL_HZ = 30;

    let calculator: Calculator;
    let divEle: HTMLDivElement;

    let localMeta = createUserMetadata();

    let inviteLink: string;

    let nameStore = writable<UserMetadata[]>([]);

    const start = () => {

        const ydoc = new Y.Doc();

        const urlSearchParams = new URLSearchParams(location.search);
        const roomId = urlSearchParams.has("id") ? urlSearchParams.get("id") : makeId(6);

        inviteLink = `${window.location.toString().split("?")[0]}?id=${roomId}`;
        
        const provider = new WebrtcProvider(`desmos-${roomId}`, ydoc, {
            signaling: [ "wss://signal-us-east-1d.xacer.dev:443" ]
        });

        provider.awareness.setLocalStateField("user", localMeta);

        provider.connect();

        provider.awareness.on('change', () => {
            nameStore.update(_ => Array.from(provider.awareness.getStates().values()).map(u => u.user).slice(1) as UserMetadata[]);
        });
        
        const yarr = ydoc.getArray<ExpressionState>("equations");
        const userSelections = ydoc.getMap<number>("selections");
        const userSelectionNodes = new Map<string, HTMLElement>();

        userSelections.observe(_ => {
            // Grab all user states
            const statesIter = provider
                .awareness
                .getStates()
                .values() as IterableIterator<{ user: UserMetadata }>;

            // Transform into array
            for (let { user: meta } of statesIter) {
                // Skip the userId
                if (meta.userId == localMeta.userId) continue;

                let index = userSelections.get(meta.userId);

                if (index !== undefined && index >= 0) {

                    // Create widget if it doesn't exist
                    if (!userSelectionNodes.has(meta.userId)) {
                        const node = document.getElementById(`icon-${meta.userId}`)?.cloneNode() as HTMLElement;
                        userSelectionNodes.set(meta.userId, node);
                    }

                    let node = userSelectionNodes.get(meta.userId) as HTMLElement;

                    // Show widget
                    node.style.setProperty("display", "block");
                    
                    // Find box and add the node to the box
                    // NOTE: Calling appendChild when "node"
                    // is already a child simply removed
                    // "node" from it's original parents
                    // and adds it to the new parents.
                    let box = Array.from(
                        document.getElementsByClassName("dcg-expressionitem")
                    )[index];
                    
                    box.appendChild(node);

                } else {
                    // Hide widget, if it exists
                    userSelectionNodes
                        .get(meta.userId)?.style
                        .setProperty("display", "none");
                }
            }
        });

        calculator = Desmos.GraphingCalculator(divEle, {
            autosize: true,
            images: false,
            folders: false,
            expressions: true,
            trace: true
        });

        // calculator.observe("selectedExpressionId", console.log);

        let pastExpressions = calculator.getExpressions();

        yarr.observe(() => {

            let newExpressions = yarr.toArray();
            let curExpressions = calculator.getExpressions();

            if (areExpressionsEqual(pastExpressions, newExpressions)) {
                return;
            }

            // delete removed expressions
            calculator.removeExpressions(curExpressions.filter(u => {
                return !newExpressions.find(v => v.id == u.id);
            }).map(e => {
                console.log("Removing ", e.id);
                return { id: e.id as string };
            }));

            newExpressions.forEach(newExpression => {
                calculator.setExpression(newExpression);
            });
            
            // go through each expression:
            let currentExpressions = calculator.getExpressions();
            let shouldReorder = newExpressions.some((expr, index) => {
                return currentExpressions[index].id != expr.id
            });

            // only if we need to re-order
            // so far this is the only way I've found
            // since Desmos API doesn't care about order
            if (shouldReorder) {
                console.log("Reordering...");
                calculator.setBlank({ allowUndo: true });
                calculator.setExpressions(newExpressions);
            }

            // update cache
            pastExpressions = newExpressions;
        });

        function getSelectedIndex() {
            const allEquations = Array.from(document.getElementsByClassName("dcg-expressionitem"));
            const selected = allEquations.findIndex(div => div.classList.contains("dcg-selected"));            
            return selected;
        }


        setInterval(() => {
            let selected = getSelectedIndex();
            let lastIndex = userSelections.get(localMeta.userId);
            if (lastIndex != selected) userSelections.set(localMeta.userId, selected);
        }, 1000 / 10);

        setInterval(() => {
            let newExpressions = calculator.getExpressions();

            if (!areExpressionsEqual(newExpressions, pastExpressions)) {
                // encode document as single update
                // TODO: ensure that the transaction only
                // encodes the differences
                pastExpressions = newExpressions;
                ydoc.transact(() => {
                    yarr.delete(0, yarr.length);
                    yarr.insert(0, newExpressions);
                });
            }

        }, 1000 / POLL_HZ);
    }

</script>

<svelte:head>
    <script 
        src="https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
        on:load={start}
    ></script>
</svelte:head>

<main>
    <!-- Top bar -->
    <section>
        
        <span 
            class="color-icon yours" 
            style:background-image="url({localMeta.imageUrl})"
            style:border-color="{localMeta.colorGroup.color}"
        />
        
        {#each $nameStore as meta}
            <span 
                class="color-icon" 
                style:background-image="url({meta.imageUrl})"
                style:border-color="{meta.colorGroup.color}"
            />
        {/each}

        {#if inviteLink}
            <button class="invite-link" on:click={()=>window.navigator.clipboard.writeText(inviteLink)}>
                Copy Invite<br>Link
            </button>
        {/if}

    </section>

    <!-- Desmos graph container -->
    <div
        id="desmos-graph"
        bind:this={divEle}
    />
</main>

{#each $nameStore as meta}
    <span 
        class="color-icon movable"
        id="icon-{meta.userId}"
        style:background-image="url({meta.imageUrl})"
        style:border-color="{meta.colorGroup.color}"
        style:display="none"
    />
{/each}


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

    .movable {
        position: absolute;
        right: 0px;
        top: 0px;
        z-index: 10;
        display: hidden;
        pointer-events: none;
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

