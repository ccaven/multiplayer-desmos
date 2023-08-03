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

<div class="w-12 h-12 p-2">
    <div 
        class="cursor-pointer w-full h-full scale-75"
        on:click={()=>activated=true}
        on:keydown={null}
    >
        <div class="w-8 h-[0.25rem] bg-white absolute translate-y-[0.875rem] rounded-full"></div>
        <div class="w-[0.25rem] h-8 bg-white absolute translate-x-[0.875rem] rounded-full"></div>
    </div>
</div>

<div 
    class="h-12 mr-2 p-0 grid justify-center -translate-y-[0.05rem] cursor-pointer"
    on:click={()=>activated=true}
    on:keydown={null}
>
    <p class="text-2xl text-white font-normal place-self-center mono">Invite others</p>
</div>





<!-- Background -->
<div
    class="
        absolute top-0 left-0 w-screen h-screen flex 
        justify-center items-center bg-transparent z-10
        {activated?"opacity-100":"opacity-0"} transition-opacity
        {activated?"pointer-events-auto":"pointer-events-none"}
    "
    style:background-color="rgba(0, 0, 0, 0.2)"
>

    <!-- Modal -->
    <div 
        class="rounded-lg p-6 text-white inline text-lg shadow-md bg-gray-800"
    >
        <p>
            Click to copy your personalized invite link:
            <span
                class="border-2 border-white p-2 cursor-pointer ml-1"
                style:font-family="Courier New"
                on:click={() => {
                    navigator.clipboard.writeText(url);
                    activated = false;
                    alert("Copied link!");
                }}
                on:keydown={()=>{}}
            >
                {url}
            </span>
        </p>
    </div>
</div>
