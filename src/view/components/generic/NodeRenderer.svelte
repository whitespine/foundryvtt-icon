<script>
    import { IcoNode } from "../../../util/nlp";
    import InlinePeek from "../preview/InlinePeek.svelte";
    import LargeRoll from "./dice/LargeRoll.svelte";
    import MediumRoll from "./dice/MediumRoll.svelte";
    import SmallRoll from "./dice/SmallRoll.svelte";
    import { createEventDispatcher } from "svelte";

    /** @type {IcoNode} Our specific node */
    export let node;

    /** Our handler for when children ask for siblings. */
    function handleAddSibling(evt) {
        node.children = [...node.children, new IcoNode(evt.detail)];
    }

    const dispatch = createEventDispatcher();

    /** Add a child node to this node */
    function addChild(t) {
        node.children = [...(node.children || []), new IcoNode(t)];
    }

    /** If configured with a formula, request a roll and add it as a node. */
    async function requestRoll() {
        let roll = new Roll(node.formula);
        await roll.roll();
        let volume = game.settings.get("core", "globalInterfaceVolume");
        game.audio.play(CONFIG.sounds.dice, { volume });
        addChild({
            roll: roll.toJSON(),
            rollSize: node.rollSize
        });
        saveSelf();
    }

    // Request this node be persisted
    function saveSelf() {
        dispatch("savenode", node);
    }

    /** Post the tooltip */
    function postDescription() {
        ChatMessage.create({
            content: `<strong>${node.innerText()}</strong>: ${node.tooltip}`,
        });
    }

    /** Generic click handler, multiplexes to more specific options */
    function click(event) {
        if(event.target.closest(".dice-roll, .inline-roll")) return;

        if (node.formula) {
            requestRoll();
        } else if (node.tooltip) {
            postDescription();
        }
    }

    let clickable;
    $: clickable = !!(node.tooltip || node.formula);
</script>

{#if !node}
    Err
{:else if node.roll}
    {#if node.rollSize === "large"}
        <LargeRoll roll={node.roll} />
    {:else if node.rollSize === "medium"}
        <MediumRoll roll={node.roll} />
    {:else}
        <SmallRoll roll={node.roll} />
    {/if}
{:else if node.referenceUUID}
    <InlinePeek uuid={node.referenceUUID}>{node.referenceBody || "ERR"}</InlinePeek>
{:else if node.tag}
    <svelte:element this={node.tag} on:click={click} class:clickable data-tooltip={node.tooltip ?? null}>
        {#each node.children || [] as child}
            <svelte:self node={child} on:addsibling={handleAddSibling} on:savenode={saveSelf} />
        {/each}
    </svelte:element>
{:else}
    <!-- svelte-ignore missing-declaration -->
    {#await TextEditor.enrichHTML(node.text, {async: false, rolls: false})}
        {node.text} 
    {:then enriched} 
        {@html enriched} 
    {/await}
{/if}

<style lang="scss">
    .clickable {
        font-weight: bold;
        cursor: pointer;
    }
</style>
