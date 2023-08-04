<script lang="ts">
    import ImagePart from "$lib/homepage/ImagePart.svelte";
    import TextPart from "$lib/homepage/TextPart.svelte";

    import { startSmoothScroll } from "$lib/homepage/smoothScroller";
    import { onMount } from "svelte";
    
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
        "homepage/built-for-tutors-by-tutor.png"
    ];

    let btn_texts = [
        "Start Graphing",
        "",
        "",
        "",
        "View Source Code"
    ];

    let btn_links = [
        "/app",
        "/app",
        "",
        "",
        "https://github.com/ccaven/multiplayer-desmos"
    ];

    onMount(() => {

        let increments = window.innerHeight;
        console.log(increments);

        //startSmoothScroll(increments);

    });

</script>

<div>

    {#each texts as text, i}
        <div class="bg-white">
            
            <div class="w-full max-w-6xl mx-auto h-[40rem] grid grid-cols-2 grid-rows-1 bg-white">

                {#if i % 2 == 1}
                    <ImagePart url={images[i]}/>
                    <TextPart {text} btnText={btn_texts[i]} btnUrl={btn_links[i]}/>
                {:else}
                    <TextPart {text} btnText={btn_texts[i]} btnUrl={btn_links[i]}/>
                    <ImagePart url={images[i]}/>
                {/if}

            </div>
            
        </div>
    {/each}

</div>