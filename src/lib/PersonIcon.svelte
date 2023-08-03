<script lang="ts">
    export let color: string;
    export let bgColor: string | undefined = "";
    export let outlineColor: string = "#f3f4f6";
</script>

<div>
    <div 
        class="
            w-12 h-12 rounded-full bg-clip-content 
            outline-2 
            overflow-hidden p-0 m-0
            mr-2 ml-2
        "
        style:outline-style="solid"
        style:background-color={bgColor}
        style:outline-color={outlineColor}
    >
        <!-- bottom circle  -->
        <div class="
            w-4 h-4 translate-x-4 translate-y-1 rounded-full 
            bg-gray-100 border-0 border-gray-200
        "
        style:background-color={color}/>
    
        <!-- bottom circle  -->
        <div class="
            w-10 h-10 translate-x-1 translate-y-2 rounded-full 
            bg-gray-100 border-0 border-gray-200
        "
        style:background-color={color}/>
    </div>
</div>
