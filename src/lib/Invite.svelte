<script lang="ts">
    export let url: string;

    let activated: boolean = false;
</script>

<img 
    src="send-icon-2.png" 
    alt="" 
    height="35px"
    style:filter="invert()"
    style:position="relative"
    style:right="5px"
    style:margin-left="8px"
    style:border="2px solid black"
    style:padding="5px"
    style:border-radius="10px"
    style:cursor="pointer"
    on:click={() => {
        // Show modal
        activated = true;
    }}
    on:keydown={()=>{}}
/>

    <!-- Background -->
<div
    style:position="absolute"
    style:top="0px"
    style:left="0px"
    style:width="100vw"
    style:height="100vh"
    style:background-color="rgba(0, 0, 0, 0.2)"
    style:z-index="10"
    style:display={activated?"flex":"none"}
    style:justify-content="center"
    style:align-items="center"
    style:transition="0.2s ease"
    style:opacity={activated?"100%":"0%"}
>

    <!-- Modal -->
    <div 
        style:background-color="rgb(42, 42, 42)"
        style:border-radius="10px"
        style:padding="20px"
        style:color="white"
        style:display="inline"
        style:font-family="sans serif"
        style:font-size="1.2em"
        style:box-shadow="0px 0px 15px gray"
    >
        <p>
            Click to copy the link:
            <span
                style:font-family="Courier New"
                style:border="1px solid white"
                style:padding="5px"
                style:cursor="pointer"
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
