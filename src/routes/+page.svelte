<script lang="ts">
    import ImagePart from "$lib/homepage/ImagePart.svelte";
    import TextPart from "$lib/homepage/TextPart.svelte";
    
    import "../app.css";

    let texts = [
        "Let's learn together",
        "Invite others to your graph",
        "Point to interesting intersections",
        "See who is editing what",
        "Built for tutors, by a tutor",
    ];

    let images = [
        "homepage/lets-learn-together.png",
        "homepage/invite-others.png",
        "homepage/point-to-intersections.png",
        "homepage/see-who-is-editing-what.png",
        "homepage/many-players.png"
    ];

</script>

<div class="overflow-y-scroll w-full h-screen absolute">

    {#each texts as text, i}
        <div class="w-full h-full bg-white">
            
            <div class="w-full h-full grid grid-cols-2 grid-rows-1 bg-transparent">

                {#if i % 2 == 1}
                    <ImagePart url={images[i]}/>
                    <TextPart {text}/>
                {:else}
                    <TextPart {text}/>
                    <ImagePart url={images[i]}/>
                {/if}

            </div>
            
        </div>
    {/each}

</div>