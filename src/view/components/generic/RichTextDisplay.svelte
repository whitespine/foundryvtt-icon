<script>
    import { getContext } from "svelte";
    import { fullProcessWrapped } from "../../../util/nlp";
    import NodeRenderer from "./NodeRenderer.svelte";

    // For when you don't really care about persistence and just want to blit some text

    /** @type {string} Raw text to show */
    export let body;

    export let actor = getContext("tjs_actor");

    // Our eventual value post processing
    let init;
    $: init = fullProcessWrapped("div", body, { actor: $actor });
</script>

<NodeRenderer node={init} />
