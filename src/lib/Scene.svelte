<script lang="ts">
    import { useNetworker, type NetworkManager } from '$lib/Networker.svelte';
    import DesmosGraph from '$lib/DesmosGraph.svelte';
    import MovableModal from './MovableModal.svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import InviteLink from './InviteLink.svelte';
    import NameTag from './NameTag.svelte';

    let networker: NetworkManager = useNetworker();
    let peerList = writable<string[]>([]);
    onMount(() => {
        networker.usePeerNames().subscribe(map => {
            peerList.set([...map.values()])
        });
    });
</script>

<DesmosGraph/>

<MovableModal x={10} y={10}>
    
    {#each $peerList as peerId}
        <NameTag>{peerId}</NameTag>
    {/each}

    <InviteLink/>

</MovableModal>