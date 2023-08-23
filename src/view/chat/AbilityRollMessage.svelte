<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { setContext } from "svelte";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
    import { Node } from "../../util/nlp";
    import NodeSequence from "../components/generic/NodeSequence.svelte";
    import AbilityDetail from "../components/combat/AbilityDetail.svelte";

    // import { fly, fade } from "svelte/transition";

    /** @type {ChatMessage} */
    export let msg;
    let tjs_msg;
    $: tjs_msg = new TJSDocument(msg);
    let flags;
    $: flags = $tjs_msg.flags[game.system.id] ?? {};

    /**
     * Attack roll formula, which may or may not be used
     * @type {string}
     */
    let attack_roll_formula;
    $: attack_roll_formula = flags.boon === 0 ? "1d20" : boon > 0 ? `1d20 + ${boon}d6kh1` : `1d20 - ${-boon}d6kh1`;

    // Deduce the item
    let item = new TJSDocument(fromUuidSync(flags.ability_uuid) ?? undefined);

    // Setup context
    let actor = new TJSDocument($item?.actor ?? undefined);

    setContext("tjs_doc", item);
    setContext("tjs_item", item);
    setContext("tjs_actor", actor);

    // Shorthand for the selected choice
    let choice;
    $: choice = $item?.system.choices[flags.choice_index] ?? null;

    // Defaults for our nodes etc
    let attack_roll_nodes;
    $: attack_roll_nodes = [new Node({ text: "Attack: " }), new Node({ formula: attack_roll_formula })];
</script>

<div class="icon flexcol">
    {#if item}
        {#if choice?.is_attack}
            <NodeSequence initial_nodes={attack_roll_nodes} key={`${$tjs_msg.id}_to_hit`} />
        {/if}

        {#if choice}
            <AbilityDetail {choice} key={`${$tjs_msg.id}_body`} />
        {:else}
            <span>Error: Ability choice could not be resolved</span>
        {/if}
    {:else}
        Item deleted
    {/if}
</div>
