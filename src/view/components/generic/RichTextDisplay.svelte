<script>
    import { fullProcess } from "../../../util/nlp";
    import TokenRenderer from "./TokenSequence.svelte";

    /** @type {string} Raw text to show */
    export let body;

    /** Key if we are being persistent */
    export let key;

    // Our eventual value post processing
    const init = fullProcess(body, {});
</script>

<TokenRenderer initial_tokens={init} key={key} />
