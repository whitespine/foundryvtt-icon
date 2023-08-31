<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { setContext } from "svelte";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
    import { IcoNode } from "../../util/nlp";
    import AbilityDetail from "../components/combat/AbilityDetail.svelte";
    import NodeRenderer from "../components/generic/NodeRenderer.svelte";
    import { KeyStoreLookup } from "../../util/stores";
    import { writable } from "svelte/store";

    // import { fly, fade } from "svelte/transition";

    /** @type {ChatMessage} */
    export let msg;
    let tjs_msg = new TJSDocument(msg);
    let flags = {};
    $: flags = $tjs_msg.flags[game.system.id] ?? {};

    /**
     * Attack roll formula, which may or may not be used
     * @type {string}
     */
    let attack_roll_formula;
    $: attack_roll_formula = flags.boon === 0 ? "1d20" : boon > 0 ? `1d20 + ${boon}d6kh1` : `1d20 - ${-boon}d6kh1`;

    // Deduce the item
    let item = new TJSDocument(undefined);
    $: item.set(fromUuidSync(flags.ability_uuid) ?? undefined);

    // Setup context
    let actor = new TJSDocument(undefined);
    $: actor.set($item.actor ?? undefined);

    // Shorthand for the selected choice
    let choice = null;
    $: choice = $item?.system.choices[flags.choice_index] ?? null;

    // Defaults for our nodes etc
    let attack_roll_node = null;
    $: (attack_roll_node = new IcoNode({ text: "Attack: " })), new IcoNode({ formula: attack_roll_formula });

    /**
     * For ability roll persistence etc
     * @type {Record<string, object>}
     */
    let overrides = {};
    $: {
        for(let [k, v] of Object.entries(flags.nodes ?? {})) {
            overrides[k] = new IcoNode(v);
        }
    }

    function persist(key, node) {
        msg.update({
            [`flags.${game.system.id}.nodes.${key}`]: node.toObject(),
        });
    }
</script>

<div class="icon flexcol">
    {#if item}
        {#if choice?.is_attack}
            <NodeRenderer node={attack_roll_node} on:savenode={(evt) => persist("attack", evt.detail)} />
        {/if}

        {#if choice}
            <AbilityDetail {choice} {overrides} on:savenode={(evt) => persist(evt.detail[0], evt.detail[1])} />
        {:else}
            <span>Error: Ability choice could not be resolved</span>
        {/if}
    {:else}
        Item deleted
    {/if}
</div>
