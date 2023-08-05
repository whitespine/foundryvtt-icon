<script>
    import { getContext } from "svelte";
    import { fullProcess } from "../../../util/nlp";
    import TokenRenderer from "./TokenSequence.svelte";

    /** @type {string} Raw text to show */
    export let body;

    /** Key if we are being persistent */
    export let key;

    export let actor = getContext("actor");

    // Our eventual value post processing
    let init;
    $: init = fullProcess(body, { actor });
</script>

<TokenRenderer initial_tokens={init} key={key} />
