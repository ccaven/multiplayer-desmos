<script lang="ts">
    import Networker, { type NetworkManager } from '$lib/Networker.svelte';
    import DesmosGraph from '$lib/DesmosGraph.svelte';
    import MovableModal from './MovableModal.svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    let networker: NetworkManager;

    let peerList = writable<string[]>([]);
    onMount(() => {
        networker.usePeerNames().subscribe(map => {
            peerList.set([...map.values()])
        });
    });
</script>

<Networker bind:networker={networker}>
    <DesmosGraph/>

    <MovableModal x={10} y={10}>
        
        {#each $peerList as peerId}
            <p style:display="inline">{peerId}</p>
        {/each}
        <p style:display="inline">Test</p>

        <button on:click={() => navigator.clipboard.writeText(networker.useJoinLink())}>
            Copy Invite Link
        </button>    
    </MovableModal>
</Networker>

<style>
    p {
        background-color: darkred;
        padding: 0.3em;
        color: white;
        border: 1px solid black;
        border-radius: 50%;
    }
</style>
