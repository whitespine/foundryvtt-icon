<script>
    import { getContext } from "svelte";
    import { fullProcess } from "../../../util/nlp";
    import NodeSequence from "./NodeSequence.svelte";

    /** @type {string} Raw text to show */
    export let body;

    export let actor = getContext("tjs_actor");

    // Our eventual value post processing
    let init;
    $: init = fullProcess(body, { actor: $actor });
</script>

<NodeSequence nodes={init} on:savenodes />
