<script>
    import { Token } from "../../../util/nlp";
    import { tooltip } from "@svelte-plugins/tooltips";
    import SmallRoll from "./dice/SmallRoll.svelte";
    import { createEventDispatcher } from "svelte";
    import { TJSDialog } from "#runtime/svelte/application";

    /** @type {Token} Our specific token */
    export let token;

    /** Our handler for when children ask for siblings. */
    function handleAddSibling(evt) {
        token.children = [...token.children, new Token(evt.detail)];
    }

    const dispatch = createEventDispatcher();

    /** If configured with a formula, request a roll and add it as a token. */
    async function requestRoll() {
        let roll = new Roll(token.formula);
        await roll.roll();
        dispatch("addsibling", {
            roll: roll.toJSON(),
        });
        dispatch("savetokens");
    }

    /** Summon a full tooltip */
    function summonDescription() {
        console.log("hey");
        /*
         */
        new TJSDialog({
            content: token.tooltip,
            modal: true,
        }).render(true, { focus: true });
        // TJSDialog.prompt({ content: token.tooltip });
    }
</script>

{#if token.children}
    <!-- Nothing special for children-->
    {#each token.children as child}
        <svelte:self token={child} on:addsibling={handleAddSibling} on:savetokens />
    {/each}
{:else if token.roll}
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

<style lang="scss">
    .formula {
        cursor: pointer;
    }
</style>
