<script lang="ts">
    import { useNetworker } from "./Networker.svelte";

    let networker = useNetworker();
</script>

<button on:click={() => navigator.clipboard.writeText(networker.useJoinLink())}>
    Copy Invite Link
</button>

<style>
    button {
        display: inline;
        background-color: darkblue;
        color: white;
        padding: 0.3em;
        border: 1px solid black;
        border-radius: 10px;
        font-family: 'HelveticaNeue-Light','Helvetica Neue Light','Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif;
    }
</style>