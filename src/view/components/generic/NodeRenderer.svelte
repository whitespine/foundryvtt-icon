<script>
    import { Node } from "../../../util/nlp";
    import SmallRoll from "./dice/SmallRoll.svelte";
    import { createEventDispatcher } from "svelte";
    import { TJSDialog } from "#runtime/svelte/application";

    /** @type {Node} Our specific node */
    export let node;

    /** Our handler for when children ask for siblings. */
    function handleAddSibling(evt) {
        node.children = [...node.children, new Node(evt.detail)];
    }

    const dispatch = createEventDispatcher();

    /** Add a child node to this node */
    function addChild(t) {
        node.children = [...(node.children || []), new Node(t)];
    }

    /** If configured with a formula, request a roll and add it as a node. */
    async function requestRoll() {
        let roll = new Roll(node.formula);
        await roll.roll();
        let volume = game.settings.get("core", "globalInterfaceVolume");
        game.audio.play(CONFIG.sounds.dice, { volume });
        addChild({
            roll: roll.toJSON(),
        });
        dispatch("savenodes");
    }

    /** Post the tooltip */
    function postDescription() {
        ChatMessage.create({
            content: `<strong>${node.innerText()}</strong>: ${node.tooltip}`,
        });
    }

    /** Generic click handler, multiplexes to more specific options */
    function click() {
        if (node.formula) {
            requestRoll();
        } else if (node.tooltip) {
            postDescription();
        }
    }

    let clickable;
    $: clickable = !!(node.tooltip || node.formula);
</script>

{#if node.roll}
    <SmallRoll roll={node.roll} />
{:else if node.tag}
    <svelte:element this={node.tag} on:click={click} class:clickable data-tooltip={node.tooltip ?? null}>
        {#each node.children || [] as child}
            <svelte:self node={child} on:addsibling={handleAddSibling} on:savenodes />
        {/each}
    </svelte:element>
{:else}
    {node.text}
{/if}

<style lang="scss">
    .clickable {
        font-weight: bold;
        cursor: pointer;
    }
</style>
