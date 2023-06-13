<script lang="ts">
    import { spring } from 'svelte/motion';

    export let x: number;
    export let y: number;

    let _x = spring(x);
    let _y = spring(y);

    export function setX(x: number) { _x.set(x); }
    export function setY(y: number) { _y.set(y); }
</script>

<div 
    style:bottom={$_y+"px"} 
    style:right={$_x+"px"}
>
    <slot></slot>
</div>

<style>
    div { 
        position: fixed;
    }
</style>