<script lang="ts">
    import DesmosGraph from '$lib/DesmosGraph.svelte';
    import InviteLink from './InviteLink.svelte';

    let graph: DesmosGraph;
</script>

<DesmosGraph bind:this={graph}/>
<InviteLink {graph}/>
