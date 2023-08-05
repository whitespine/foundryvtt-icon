<script>
    import { Token } from "../../../util/nlp";
    import { tooltip } from "@svelte-plugins/tooltips";
    import SmallRoll from "./dice/SmallRoll.svelte";

    /** @type {Token} Our specific token */
    export let token;


    /** Our children can ask for siblings. How fun!*/
    function addSibling(evt) {
        token.children = [...token.children, new Token(evt.detail)]
    }

    const dispatch = createEventDispatcher();

    /** We can be configured to request a roll! */
    function requestRoll() {

    }

	function sayHello() {
		dispatch('message', {
			text: 'Hello!'
		});
	}
</script>

{#if token.children}
    <!-- Nothing special for children-->
    {#each token.children as child}
        <svelte:self token={child} on:addSibling={addSibling} />
    {/each}
{:else if token.roll}
    <SmallRoll roll={token.roll} />
{:else if token.text}
    {#if token.tooltip}
        <span use:tooltip={{ content: token.tooltip }}><b>{token.text}</b></span>
    {:else}
        <span><b>{token.text}</b></span>
    {/if}
{:else}
    ERR
{/if}

<style lang="scss">
</style>
