<script>
    import { Token, fullProcess } from "../../../util/nlp";
    import { tooltip } from "@svelte-plugins/tooltips";

    /** @type {string} Raw html-ish text to show */
    export let body;

    // Our eventual value post processing
    export let chunks = [];
    $: chunks = fullProcess(body, {}) ;
    $: console.log(chunks);
        
    // Basically? Turns every keyword and stuff into a hoverable thing, dice into rollable things,
    // areas into summonable things, etc. Heavy WIP
</script>

<div>
    {#each chunks as chunk}
        {#if typeof chunk === "string"}
            <span>{chunk}</span>
        {:else if chunk instanceof Token}
            <span use:tooltip={{content: chunk.tooltip}}><b>{chunk.text}</b></span>
        {/if}
    {/each}
</div>


<style lang="scss">

</style>
