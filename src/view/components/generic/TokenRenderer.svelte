<script>
    import { Token } from "../../../util/nlp";
    import { tooltip } from "@svelte-plugins/tooltips";
    import SmallRoll from "./dice/SmallRoll.svelte";
    import { createEventDispatcher } from "svelte";

    /** @type {Token} Our specific token */
    export let token;

    /** Our handler for when children ask for siblings. */
    function handleAddSibling(evt) {
        token.children = [...token.children, new Token(evt.detail)];
    }

    const dispatch = createEventDispatcher();

    /** We can be configured to request a roll! */
    async function requestRoll() {
        let roll = new Roll(token.formula);
        await roll.roll();
        dispatch("addsibling", { 
            roll: roll.toJSON() 
        });
        console.log("A");
    }

    function sayHello() {
        dispatch("message", {
            text: "Hello!",
        });
    }
</script>

{#if token.children}
    <!-- Nothing special for children-->
    {#each token.children as child}
        <svelte:self token={child} on:addsibling={handleAddSibling} />
    {/each}
{:else if token.roll}
    <SmallRoll roll={token.roll} />
{:else if token.formula}
    <span class="formula" on:click={requestRoll}>{token.text || token.formula}</span>
{:else if token.text}
    {#if token.tooltip}
        <span use:tooltip={{ content: token.tooltip }}><b>{token.text}</b></span>
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
