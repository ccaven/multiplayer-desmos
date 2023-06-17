<script lang="ts">
    import Scene from '$lib/Scene.svelte';
    import { writable } from 'svelte/store';
    import { setContext } from 'svelte';
    import Networker from '$lib/Networker.svelte';
    import { onMount } from 'svelte';
    let enabled = false;
    let name = writable<string>("");
    setContext("player-name", name);

    let goButton: HTMLButtonElement;

    onMount(() => {
        name.subscribe(newName => {
            console.log(newName);
            if (newName.length > 0) {
                goButton.style.background = "#00aa1c";
            } else {
                goButton.style.background = "black";
            }
        });
    });

    function onClick() {
        if ($name.length > 0) enabled = true;
    }

</script>

{#if enabled}
    <Networker>
        <Scene/>
    </Networker>
{:else}
    <div id="background">
        <div id="begin">
            <input type="text" placeholder="What's your name?" bind:value={$name}>
            <button on:click={onClick} bind:this={goButton}>
                {#if new URLSearchParams(location.search).has("join-id")}
                    Join Room
                {:else}
                    Create Graph
                {/if}
            </button>    
        </div>
    </div>
{/if}

<style>
    :global(body) {
        overflow: hidden;
        padding: 0;
        margin: 0;
        transition: 0.1s ease;
    }

    #background {
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        position: absolute;
        background-image: radial-gradient(#292929 10%, transparent 10%);
        background-color: rgb(240, 240, 240);
        background-position: 0 0, 5px 5px;
        background-size: 15px 15px;
        display: grid;
        grid-template-columns: 1fr minmax(400px, 1fr) 1fr;
        grid-template-rows: 1fr minmax(400px, 1fr) 1fr;
        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    }

    #begin {
        border-radius: 25px;
        grid-column: 2;
        grid-row: 2;
        overflow: hidden;
        background-color: rgba(250, 250, 250, 1.0);
        box-shadow: 0px 0px 100px rgb(0 0 0 / 0.5);
    }

    #begin > input {
        width: 100%;
        height: 40%;
        font-size: x-large;
        text-align: center;
        padding: 0;
        margin: 0;
        background: none;
        border: none;
        font-family: inherit;
        transition: 0.5s ease;
    }

    #begin > input:focus {
        outline-width: 0;
    }

    #begin > button {
        width: 100%;
        height: 60%;
        font-size: 2em;
        padding: 0;
        margin: 0;
        color: white;
        border: none;
        cursor: pointer;
        font-family: inherit;
        text-shadow: 0 0 10px rgb(0 0 0 / 0.5);
        transition: 0.5s ease;
    }

    #begin > button:hover {
        font-size: 2.5em;
        text-shadow: 0 0 50px rgb(0 0 0 / 1);
    }
</style>