<script lang="ts">

    // TODO:
    // - Allow annotatons
    // - Style button link
    import * as Y from 'yjs';
    import { WebrtcProvider } from 'y-webrtc';
    import { makeId, createUserMetadata, areExpressionsEqual } from './helper';
    import { writable } from 'svelte/store';
    import Invite from './Invite.svelte';

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
        x: number, y: number, 
        in: boolean, userId: string, 
        color: string, highlight: string
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
        provider.awareness.setLocalStateField("mouse-in", true);

        provider.connect();

        provider.awareness.on('change', () => {

            const users = Array.from(provider.awareness.getStates().values()) as {
                user: UserMetadata,
                "mouse-x": number,
                "mouse-y": number,
                "mouse-in": boolean
            }[];

            nameStore.update(_ => users.map(u => u.user).slice(1) as UserMetadata[]);

            remoteMousePositions.update(_ => users.map(u => ({
                x: u["mouse-x"],
                y: u["mouse-y"],
                in: u["mouse-in"],
                userId: u["user"]["userId"],
                color: u["user"]["colorGroup"]["color"],
                highlight: u["user"]["colorGroup"]["light"]
            })));           
        
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

        /** 
         * @todo: figure out how to do this outside of setTimeout.
         *        We need to wait for the DOM to reload
         */
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
        if (pix.x > off.right - 10) pix.x = off.right - 10;
        if (pix.y > off.top + off.height - 10) pix.y = off.top + off.height - 10;

        let x = pix.x;
        let y = pix.y + doff.top;

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
</script>

<svelte:head>
    <script 
        src="https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
        on:load={start}
    ></script>
</svelte:head>

<div class="
    overflow-hidden w-screen h-screen absolute 
    grid grid-cols-1 grid-rows-[auto_1fr]
">
    <!-- Top bar -->
    <div class="
        h-20 overflow-hidden row-span-1 p-0 
        bg-gray-800 flex place-items-center pl-2
    ">
        <a href="/" target="_blank">
            <img 
                src="/icons8-desmos-200.png" 
                class="h-20 m-0" 
                alt="Desmos icon by Icons8"
            >
        </a>
        
        <span 
            class="
                w-16 h-16 p-0 mr-2 ml-2 
                bg-center bg-no-repeat bg-cover 
                rounded-full border-4
            " 
            style:background-image="url({localMeta.imageUrl})"
            style:border-color="{localMeta.colorGroup.color}"
        />

        <div
            class="w-1 h-16 bg-white mr-2 ml-2"
        />
        
        {#each $nameStore as meta}
            <span
                class="
                    w-16 h-16 p-0 mr-2 ml-2 
                    bg-center bg-no-repeat bg-cover 
                    rounded-full border-4
                "
                style:background-image="url({meta.imageUrl})"
                style:border-color="{meta.colorGroup.color}"
            />
        {/each}

        <Invite url={inviteLink}/>        

    </div>

    <!-- Desmos graph container -->
    <div
        class="row-span-1 w-full h-full"
        bind:this={divEle}
    />

</div>

<div 
    class="absolute right-2 bottom-2 text-gray-700 text-sm"
>
    <a 
        class="text-green-600"
        target="_blank" 
        href="https://icons8.com/icon/kFcdher8hXQj/desmos"
    >
        Desmos
    </a> 
    icon by 
    <a 
        class="text-green-600"
        target="_blank" 
        href="https://icons8.com"
    >
        Icons8
    </a>
</div>

{#each $remoteMousePositions as pos}
    <svg
        class="absolute top-0 left-0 w-8 h-8 pointer-events-none"
        style:transform={mathToCSSTransform(pos)}
    >
        <polygon 
            points="0,0 15,5 12,8 20,18 18,20 8,12 5,15" 
            fill={pos.color}
            stroke="black"
            stroke-width="2px"
            opacity="0.5"
        />
    </svg>
{/each}

{#each $nameStore as meta}
    <span 
        class="
            absolute right-4 top-1 w-12 h-12 p-0 mr-2 ml-5 
            border-2 bg-no-repeat bg-center bg-cover rounded-full 
            hidden pointer-events-none
        "
        id="icon-{meta.userId}"
        style:background-image="url({meta.imageUrl})"
        style:border-color="{meta.colorGroup.color}"
    />
{/each}


<style>
    :global(.dcg-graph-outer) {
        cursor: none;
    }
</style>

