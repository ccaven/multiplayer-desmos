<script lang="ts">

    // TODO:
    // - Allow annotatons
    // - Style button link

    import { onMount } from 'svelte';
    import * as Y from 'yjs';
    import { WebrtcProvider } from 'y-webrtc';
    import { makeId, objectEquals, createUserMetadata, areExpressionsEqual } from './helper';
    import { writable, type Writable } from 'svelte/store';

    type UserMetadata = ReturnType<typeof createUserMetadata>;

    type ExpressionState = Desmos.ExpressionState;
    type Calculator = Desmos.Calculator;
    
    const POLL_HZ = 30;

    let calculator: Calculator;
    let divEle: HTMLDivElement;
    let grapherDivEle: HTMLDivElement;

    let localMeta = createUserMetadata();

    let inviteLink: string;

    let nameStore = writable<UserMetadata[]>([]);

    type RemoteMouse = {
        x: number, y: number, in: boolean, userId: string
    };
    type RemoteMouseDisplay = {
        x: Writable<number>, y: Writable<number>, size: Writable<number>
    };

    let remoteMousePositions = writable<RemoteMouse[]>([]);

    const start = () => {

        const ydoc = new Y.Doc();

        const urlSearchParams = new URLSearchParams(location.search);
        const roomId = urlSearchParams.has("id") ? urlSearchParams.get("id") : makeId(6);

        inviteLink = `${window.location.toString().split("?")[0]}?id=${roomId}`;
        
        const provider = new WebrtcProvider(`desmos-${roomId}`, ydoc, {
            signaling: [ "wss://signal-us-east-1d.xacer.dev:443" ]
        });

        provider.awareness.setLocalStateField("user", localMeta);

        provider.awareness.setLocalStateField("mouse-x", 0);
        provider.awareness.setLocalStateField("mouse-y", 0);
        provider.awareness.setLocalStateField("mouse-in", false);

        provider.connect();

        type ProviderAwarenessUpdate = {
            added: any[],
            updated: any[],
            removed: any[]
        };

        // !!!!
        // TODO
        // Check changes: If changes were made to the "user" field, do that
        // If changes were made to the "mouse-in" or "mouse-pos" field, do that
        provider.awareness.on('change', ({ added, updated, removed }: ProviderAwarenessUpdate) => {
            //console.log(added, updated, removed);
            const users = Array.from(provider.awareness.getStates().values());

            nameStore.update(_ => users.map(u => u.user).slice(1) as UserMetadata[]);

            // Update remoteMousePositions

            remoteMousePositions.update(() => {
                let info: RemoteMouse[] = [];

                users.forEach(u => {

                    if (u.user.userId == localMeta.userId) return;
                    
                    info.push({
                        x: u["mouse-x"],
                        y: u["mouse-y"],
                        in: u["mouse-in"],
                        userId: u["user"]["userId"]
                    }); 

                });

                return info;
            });

            
        
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

        // Add mouse events
        setTimeout(() => {
            grapherDivEle = divEle.getElementsByClassName("dcg-grapher").item(0) as HTMLDivElement;
            grapherDivEle.addEventListener("mouseenter", () => {;
                provider.awareness.setLocalStateField("mouse-in", true);
            });
            grapherDivEle.addEventListener("mouseleave", () => {
                provider.awareness.setLocalStateField("mouse-in", false);
            });
            grapherDivEle.addEventListener("mousemove", event => {
                if (divEle == null) return;

                let clientBoundingRect = divEle.getBoundingClientRect();

                // Check if mouse is inside canvas
                let mathPos = calculator.pixelsToMath({
                    x: event.pageX - clientBoundingRect.left,
                    y: event.pageY - clientBoundingRect.top
                });

                provider.awareness.setLocalStateField("mouse-x", mathPos.x);
                provider.awareness.setLocalStateField("mouse-y", mathPos.y);
            });
        }, 100);

        // !!!
        // Here, we fix the Desmos bug: "expression with id [id] already exists"
        // by removing the event listeners
        // According to stackoverflow the only way is to
        // replace the element with a clone of itself
        // https://stackoverflow.com/questions/4386300/javascript-dom-how-to-remove-all-event-listeners-of-a-dom-object
        {
            let newExprDiv: HTMLDivElement = document.getElementsByClassName("dcg-new-math-div").item(0) as HTMLDivElement;

            // TypeScript doesn't like that cloneNode returns a "Node"
            // @ts-ignore
            newExprDiv.replaceWith((newExprDiv=newExprDiv.cloneNode(true)));

            // Add new event listener to manually add an expression
            newExprDiv.onclick = () => {
                // ... probably should just look at how many expressions exist already
                let newId = Math.random() * 10000 | 0;
                
                calculator.setExpression({
                    id: newId.toString(),
                    type: "expression",
                    latex: " " // <-- add a space to not count the cell as "empty"
                               //     The space doesn't display on Desmos so
                               // the user interface remains the same
                });
                // Select last expression
                setTimeout(() => {
                    // IMPORTANT: I'm using setTimeout here so the
                    // DOM has a change to update
                    // The 
                    let allExpressions = Array.from(document.getElementsByClassName("dcg-mathitem")) as HTMLDivElement[];
                    let lastExpression = allExpressions.at(-1);
                    if (lastExpression) {

                        // We have to focus the textarea
                        // because trying to .click() or .focus()
                        // the div itself does nothing
                        let ta = lastExpression.getElementsByTagName("textarea").item(0);
                        ta?.focus();
                    }
                }, 50); // <-- consider changing to a larger time...
                        // or somehow waiting for the document to sync
            }
        }

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

    let sizeCache = new Map<string, number>();
    function mathToCSSTransform(coord: RemoteMouse) {
        if (!grapherDivEle) return "";
        let pix = calculator.mathToPixels(coord);
        let doff = divEle.getBoundingClientRect();
        let off = grapherDivEle.getBoundingClientRect();

        if (pix.x < off.left) pix.x = off.left;
        if (pix.y < 0) pix.y = 0;
        if (pix.x > off.right) pix.x = off.right;
        if (pix.y > off.top + off.height) pix.y = off.top + off.height;

        let x = pix.x - 10;
        let y = pix.y + doff.top - 10;

        if (!sizeCache.has(coord.userId)) sizeCache.set(coord.userId, 0);

        let s = sizeCache.get(coord.userId) as number;

        if (coord.in) {
            s += (100 - s) * 0.1;
            sizeCache.set(coord.userId, s);
        } else {
            s = 0;
            sizeCache.set(coord.userId, s);
        }

        return `translate(${x}px, ${y}px) scale(${s}%)`;
    }

    // function mathToPixels(userId: string): string {
    //     if (calculator) {
    //         return "translate(50%, 50%);"
    //     }
    //     return "";
    // }

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
        <img src={(process.env.NODE_ENV === "production" ? "/multiplayer-desmos" : "") +"/icons8-desmos-200.png"} height="65px" alt="Desmos icon by Icons8">
        
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
            <button 
                class="invite-link" 
                style:place-items="center"
                style:display="flex"
                style:justify-content="center"
                
            >
                <p
                    style:padding="5px"
                    style:border="1px solid gray"
                    style:font-family="Courier New"
                    id="invite-link"
                    on:click={event=>{
                        let ele = event.target;
                        // @ts-ignore
                        ele.style.backgroundColor = "green";
                        setTimeout(() => {
                            // @ts-ignore
                            ele.style.backgroundColor = "";
                        }, 200);
                        window.navigator.clipboard.writeText(inviteLink)
                    }}
                    on:keydown={()=>{}}
                >
                    {inviteLink}
                </p>
            </button>
            
        {/if}

        

    </section>

    <!-- Desmos graph container -->
    <div
        id="desmos-graph"
        bind:this={divEle}
    />

    <div 
        style:position="absolute"
        style:right="10px"
        style:bottom="10px"
        style:font-family="sans serif"
        style:color="gray"
    >
        <a 
            target="_blank" 
            href="https://icons8.com/icon/kFcdher8hXQj/desmos"
            style:text-decoration="none"
            style:color="green"
        >
            Desmos
        </a> 
        icon by 
        <a 
            target="_blank" 
            href="https://icons8.com"
            style:text-decoration="none"
            style:color="green"
        >
            Icons8
        </a>
    </div>

    {#each $remoteMousePositions as pos}
        <div
            style:position="absolute"
            style:top=0
            style:left=0
            style:width="20px"
            style:height="20px"
            style:background-color={"red"}
            style:border-radius="10px"
            style:transform={mathToCSSTransform(pos)}
            style:pointer-events="none"
        />
    {/each}


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

        font-family: sans-serif;
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
        position: absolute;
        float: right;
        height: 100%;
        transition: 0.1s ease;
    }

    /*
    :global(div.dcg-new-expression.dcg-opened) {
        transform: translateX(-500px);
    }
    */

</style>

