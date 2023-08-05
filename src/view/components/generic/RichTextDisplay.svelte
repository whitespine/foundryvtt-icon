<script>
    import { fullProcess } from "../../../util/nlp";
    import TokenRenderer from "./TokenSequence.svelte";

    /** @type {string} Raw text to show */
    export let body;

    // Our eventual value post processing
    export let tokens = [];
    $: tokens = fullProcess(body, {}) ;
</script>

<TokenRenderer tokens={tokens} />
