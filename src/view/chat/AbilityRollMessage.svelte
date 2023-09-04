<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
    import { setContext } from "svelte";
    import { IcoNode } from "../../util/nlp";
    import AbilityDetail from "../components/combat/AbilityDetail.svelte";
    import NodeRenderer from "../components/generic/NodeRenderer.svelte";

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
    $: attack_roll_formula = flags.boon === 0 ? "1d20" : flags.boon > 0 ? `1d20 + ${flags.boon}d6kh1` : `1d20 - ${-flags.boon}d6kh1`;

    // Deduce the item
    let item = new TJSDocument(undefined);
    $: item.set(fromUuidSync(flags.ability_uuid) ?? undefined);

    // Deduce the actor
    let actor = new TJSDocument(undefined);
    $: actor.set($item?.actor ?? undefined);

    // Setup context
    setContext("tjs_actor", actor);
    setContext("tjs_item", item);

    // Shorthand for the selected choice
    let choice = null;
    $: choice = $item?.system.choices[flags.choice_index] ?? null;

    // Defaults for our nodes etc
    let attack_roll_node = null;
    $: attack_roll_node = new IcoNode({ 
        tag: "div", 
        formula: attack_roll_formula,
        rollSize: "large",
        children: [
            new IcoNode({ text: `Attack Roll: ${attack_roll_formula}` })
    ]});

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
