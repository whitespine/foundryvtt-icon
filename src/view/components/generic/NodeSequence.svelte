<script>
    import { getContext } from "svelte";
    import { Node } from "../../../util/nlp";
    import NodeRenderer from "./NodeRenderer.svelte";
    import { NODE_STORES } from "../../../util/stores";

    /** @type {Node[] | (() => Node[])} Our default node sequence if we do not recover any from node store */
    export let initial_nodes;

    /** Used for saving changes to nodes. */
    export let key;

    /** Likewise */
    let msg = getContext("message");

    /** Used for allowing updates / initialization from persistent node store */
    let node_store = NODE_STORES.get(msg?.id || "transient", {});

    // Create our update loop thingy
    let nodes;
    $: {
        if ($node_store[key]) {
            nodes = $node_store[key].map((t) => new Node(t));
        } else {
            nodes = typeof initial_nodes === "function" ? initial_nodes() : initial_nodes;
        }
    }

    // Creates a new top level node. Purely a UI event.
    function addSibling(evt, i) {
        nodes = [...nodes.slice(0, i + 1), new Node(evt.detail), ...nodes.slice(i + 1)];
    }

    /**
     * If in a message & have a unique id, persists data changes to the DB
     * @param evt Event to handle
     */
    function saveNodes() {
        if (!key) return console.debug("Not persisting change to keyless NodeSequence");
        if (!msg) return console.debug("Not persisting change to messageless NodeSequence");

        let node_data = nodes.map((t) => t.toObject());
        msg.update({ [`flags.${game.system.id}.data.nodes.${key}`]: node_data });
    }
</script>

<div>
    {#each nodes || [] as node, i}
        <NodeRenderer node={node} on:addsibling={(evt) => addSibling(evt, i)} on:savenodes={saveNodes} />
    {/each}
</div>
