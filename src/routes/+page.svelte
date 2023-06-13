<script lang="ts">
    import Scene from '$lib/Scene.svelte';
    import { writable } from 'svelte/store';
    import { setContext } from 'svelte';
    import Networker from '$lib/Networker.svelte';
    let enabled = false;
    let name = writable<string>();
    setContext("player-name", name);
</script>

<div>
    
    {#if enabled}
        <Networker>
            <Scene/>
        </Networker>
    {:else}
        <div id="begin">
            <input type="text" placeholder="What's your name?" bind:value={$name}>
            <button on:click={() => enabled=true}>
                {#if new URLSearchParams(location.search).has("join-id")}
                    Join Room
                {:else}
                    Host Room
                {/if}
            </button>    
        </div>
    {/if}
</div>

<style>
    :root(body) {
        overflow: hidden;
        padding: 0;
        margin: 0;
    }

    #begin {
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: 1fr 2fr;
        padding: 25%;
        overflow: hidden;
        border-radius: 50px;
    }

    #begin > input {
        width: 100%;
        height: 2em;
        font-size: x-large;
        text-align: center;
        padding: 0;
        margin: 0;
    }

    #begin > button {
        width: 100%;
        font-size: 2em;
        padding: 0;
        margin: 0;
    }
</style>