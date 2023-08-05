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

    /** Conditionally invokes the tooltip action if options is not null */
    function condTooltip(node, options) {
        let curr_sub = null;
        function update(new_options) {
            if (!new_options && curr_sub) {
                curr_sub.destroy();
                curr_sub = null;
            } else if (new_options && !curr_sub) {
                curr_sub = tooltip(node, new_options);
            } else if (curr_sub) {
                curr_sub.update?.(new_options);
            }
        }
        update(options);
        return {
            destroy: () => curr_sub?.destroy?.(),
            update,
        };
    }

    /** Generic click handler, multiplexes to more specific options */
    function click() {
        if (token.formula) {
            requestRoll();
        } else if (token.tooltip) {
            summonDescription();
        }
    }

    let clickable;
    $: clickable = !!(token.tooltip || token.formula);
</script>

<span
    class:inline-container={token.children}
    class:clickable
    on:click={click}
    use:condTooltip={token.tooltip ? { content: token.tooltip } : null}
>
    {#if token.roll}
        <SmallRoll roll={token.roll} />
    {:else if token.text}
        {token.text}
    {:else if token.formula}
        {token.formula}
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
    .clickable {
        font-weight: bold;
        cursor: pointer;
    }
</style>
