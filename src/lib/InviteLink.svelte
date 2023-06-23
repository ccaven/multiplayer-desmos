<script lang="ts">
    /*
    import type DesmosGraph from "./DesmosGraph.svelte";
    import { inviteLink } from "./store";

    export let graph: DesmosGraph;

    let d2: HTMLButtonElement;

    function click() {
        navigator.clipboard.writeText(inviteLink as string);

        let old = "rgb(237, 237, 237)";
        d2.style.backgroundColor = "rgb(100, 250, 100)";
        setTimeout(() => {
            d2.style.backgroundColor = old;
        }, 250);
    }

    async function loadGraph() {
        try {
            let graphUrl = prompt("Enter graph URL:");
            if (graphUrl) {
                let data: any = JSON.parse(
                    await fetch(graphUrl, { headers: { "Accept": "application/json" } })
                    .then(r=>r.blob())
                    .then(b=>b.text()));
                console.log(data);
                graph.setExpressions(data.state.expressions.list);
            }
        } catch(e) {
            console.log("Loading failed.", e);
        }
    }
    */
</script>
<!--
<div id="d1">
    <div class="d2">
        <button on:click={loadGraph} class="d3" bind:this={d2}>
            Load Graph
        </button>     
        <button on:click={click} class="d3" bind:this={d2}>
            Copy Invite Link
        </button>        
    </div>    
</div>
-->

<style>
    #d1 {
        right: 5px;
        bottom: 2px;
        position: absolute;
        display: block;
    }
    .d2 {
        position: absolute;
        float: right;
        font-size: 16px;
        text-align: center;
        white-space: nowrap;
        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
        bottom: 0px;
        right: 0px;
    }

    .d3 {
        background-color: rgb(237, 237, 237);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0,0,0,0.15);
        padding: 7px;
        margin-top: 3px;
        margin-bottom: 3px;
    }

    button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
        transition: 0.5s ease;
        cursor: pointer;
    }

    p {
        display: inline;
    }
</style>
