<script lang="ts">
    export let text: string;
</script>

<div class="col-span-1">
    <div class="flex justify-center w-full h-full">
        <div class="place-self-center">
            <p class="
                font-light text-3xl 
                animate-text bg-gradient-to-r
                from-teal-700 via-purple-700 to-orange-700 
                bg-clip-text text-transparent p-5 shadow-lg
            ">
                {text}
            </p>

            <a href="/app">
                <div class="
                    w-48 my-10 m-auto text-center 
                    bg-gradient-to-br from-purple-700 to-orange-700
                    rounded-xl p-3 drop-shadow-lg hover:-translate-y-1 transition-all
                ">
                    <p class="
                        text-xl text-white font-normal
                    ">
                        Start Graphing
                    </p>
                </div>
            </a>
        </div>
    </div>
</div>