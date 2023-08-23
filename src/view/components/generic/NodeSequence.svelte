<script>
    import { createEventDispatcher, getContext } from "svelte";
    import { Node } from "../../../util/nlp";
    import NodeRenderer from "./NodeRenderer.svelte";

    export let nodes;

    // Creates a new top level node. Purely a UI event.
    function addSibling(evt, i) {
        nodes = [...nodes.slice(0, i + 1), new Node(evt.detail), ...nodes.slice(i + 1)];
    }

    const dispatch = createEventDispatcher();

    /**
     * Emit our nodes to be saved
     * @param evt Event to handle
     */
    function saveNodes() {
        dispatch("savenodes", this.nodes);
    }
</script>

<div>
    {#each nodes || [] as node, i}
        <NodeRenderer node={node} on:addsibling={(evt) => addSibling(evt, i)} on:savenodes={saveNodes} />
    {/each}
</div>
