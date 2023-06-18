<!-- TODO: Somehow link $svelteStore to calculator expressions -->

<script lang="ts">

    import { onMount } from 'svelte';
    //import { svelteStore } from './store';
    import Desmos, { type ExpressionState } from 'desmos';
    //import { stringify, objectEquals } from './helper';

    let calculator: Desmos.Calculator;
    let divEle: HTMLDivElement;

    onMount(() => {
        calculator = Desmos.GraphingCalculator(divEle, {
            autosize: true,
            images: false,
            folders: false,
            projectorMode: false,
            notes: true
        });
    });

    export function setExpressions (expressions: ExpressionState[]) {
        calculator.setExpressions(expressions);
    }

</script>

<div 
    bind:this={divEle} 
    style:width="100vw" 
    style:height="100vh" 
/>

<style>
    /* Keep this Demsos graph fixed - we might have other HTML elements on top of it */
    div {
        top: 0;
        left: 0;
        position: fixed;
    }
</style>

