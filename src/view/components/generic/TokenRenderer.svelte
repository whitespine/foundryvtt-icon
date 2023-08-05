<script>
    import { Token } from "../../../util/nlp";
    import { tooltip } from "@svelte-plugins/tooltips";
    import SmallRoll from "./dice/SmallRoll.svelte";
    import { createEventDispatcher } from "svelte";
    import { TJSDialog } from "#runtime/svelte/application";
    import { slide } from 'svelte/transition';


    /** @type {Token} Our specific token */
    export let token;

    /** Our handler for when children ask for siblings. */
    function handleAddSibling(evt) {
        token.children = [...token.children, new Token(evt.detail)];
    }

    const dispatch = createEventDispatcher();

    /** Add a child token to this node */
    function addChild(t) {
        token.children = [...(token.children || []), new Token(t)];
    }

    /** If configured with a formula, request a roll and add it as a token. */
    async function requestRoll() {
        let roll = new Roll(token.formula);
        await roll.roll();
        addChild({
            roll: roll.toJSON(),
        });
        dispatch("savetokens");
    }

    /** Summon a full tooltip */
    function summonDescription() {
        new TJSDialog({
            content: token.tooltip,
            modal: true,
        }).render(true, { focus: true });
    }
</script>

<span class:container={token.children} transition:slide>
    {#if token.roll}
        <SmallRoll roll={token.roll} />
    {:else if token.formula}
        <span class="formula" on:click={requestRoll}>{token.text || token.formula}</span>
    {:else if token.text}
        {#if token.tooltip}
            <span use:tooltip={{ content: token.tooltip }} on:click={summonDescription}><b>{token.text}</b></span>
        {:else}
            {token.text}
        {/if}
    {:else}
        ERR
    {/if}

    <!-- Then add children -->
    {#if token.children}
        <!-- Nothing special for children-->
        {#each token.children as child}
            <svelte:self token={child} on:addsibling={handleAddSibling} on:savetokens />
        {/each}
    {/if}
</span>

<style lang="scss">
    .formula {
        cursor: pointer;
    }

    .container {
        border-radius: 5px;
        line-height: 1.5em;
        padding: 2px;
        border: var(--primary-border);
    }
</style>
