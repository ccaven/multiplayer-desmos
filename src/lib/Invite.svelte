<script lang="ts">
    export let url: string;

    let activated: boolean = false;

</script>

<!-- NOTE: the colors are weird because we apply "filter:invert()" -->
<!--
<img 
    src="send-icon-2.png" 
    alt="" 
    class="h-12 mr-2 ml-2 p-2 rounded-xl cursor-pointer border-black border-2 invert z-40"
    on:click={() => {activated = true} }
    on:keydown={()=>{}}
/>
-->

<div class="w-12 h-12">
    <div 
        class="cursor-pointer w-full h-full"
        on:click={()=>activated=true}
        on:keydown={null}
    >
        <div class="absolute translate-x-6 translate-y-6">
            <div class="
                absolute w-6 h-[0.15rem] bg-white rounded-full -translate-x-1/2 -translate-y-1/2
            "/>
            <div class="
                absolute w-[0.15rem] h-6 bg-white rounded-full -translate-x-1/2 -translate-y-1/2
            "/>
        </div>
    </div>
</div>

<div 
    class="h-12 mr-2 p-0 grid justify-center cursor-pointer -translate-y-[0.05rem]"
    on:click={()=>activated=true}
    on:keydown={null}
>
    <p class="text-xl text-white font-normal place-self-center">Invite friends</p>
</div>

<div class="
    p-2 h-12 mr-2 ml-2 grid justify-center translate-y-[0.1rem] 
    border-2 {activated?"border-opacity-100":"border-opacity-0"} transition-all border-white
    {activated?"":"invisible"}
">
    <p class="{activated?"text-opacity-100":"text-opacity-0"} transition-all text-lg text-white font-normal place-self-center font-mono">{url}</p>
</div>

<div class="w-12 h-12 cursor-pointer" on:click={()=>activated=false} on:keydown={null}>
    <div class="absolute rotate-45 translate-x-6 translate-y-6">
        <div class="
            absolute w-8 h-[0.1rem] bg-white -translate-x-1/2 -translate-y-1/2
            {activated?"bg-opacity-100":"bg-opacity-0"} transition-all
        "/>
        <div class="
            absolute w-[0.1rem] h-8 bg-white -translate-x-1/2 -translate-y-1/2
            {activated?"bg-opacity-100":"bg-opacity-0"} transition-all
        "/>
    </div>
</div>