<script lang="ts">
    import { useNetworker } from "./Networker.svelte";

    let networker = useNetworker();
    let d2: HTMLDivElement;

    function click() {
        navigator.clipboard.writeText(networker.useJoinLink());

        let old = "rgb(237, 237, 237)";
        d2.style.backgroundColor = "rgb(50, 250, 50)";
        setTimeout(() => {
            d2.style.backgroundColor = old;
        }, 250);
    }
</script>
<!--
        <button
        on:click={() => navigator.clipboard.writeText(networker.useJoinLink())}
    >
        Copy Invite Link
    </button>
-->
<div id="d1">
    <div id="d2" bind:this={d2}>
        <button on:click={click}>
            Copy Invite Link
        </button>
    </div>
</div>


<style>
    #d1 {
        right: 5px;
        bottom: 2px;
        position: absolute;
        display: block;
    }
    #d2 {
        position: absolute;
        bottom: 0;
        right: 0;
        background-color: rgb(237, 237, 237);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0,0,0,0.15);
        cursor: pointer;
        margin-top: 3px;
        margin-bottom: 3px;
        font-size: 16px;
        text-align: center;
        white-space: nowrap;
        padding: 7px;
        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
        transition: 0.5s ease;
    }

    button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }
</style>
