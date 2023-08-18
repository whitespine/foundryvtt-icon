<script>
    import { getContext } from "svelte";
    import { fullProcess } from "../../../util/nlp";
    import NodeSequence from "./NodeSequence.svelte";

    /** @type {string} Raw text to show */
    export let body;

    /** Key if we are being persistent */
    export let key;

    export let actor = getContext("tjs_actor");

    // Our eventual value post processing
    let init;
    $: init = fullProcess(body, { actor: $actor });
</script>

<NodeSequence initial_nodes={init} key={key} />
