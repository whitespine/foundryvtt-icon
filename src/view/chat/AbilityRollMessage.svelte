<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { setContext } from "svelte";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
    import { Node } from "../../util/nlp";
    import NodeSequence from "../components/generic/NodeSequence.svelte";
    import AbilityDetail from "../components/combat/AbilityDetail.svelte";

    // import { fly, fade } from "svelte/transition";

    /** @type {ChatMessage} */
    // svelte-ignore unused-export-let
    export let msg;

    setContext("message", msg);

    /**
     * The ability's UUID
     * @type {string}
     */
    export let ability_uuid;

    /**
     * The ability's choice index, or 0
     * @type {number}
     */
    export let choice_index;

    /**
     * Boons on attack rolll
     * @type {number}
     */
    export let boon;
    let attack_roll_formula;
    $: attack_roll_formula = boon === 0 ? "1d20" : boon > 0 ? `1d20 + ${boon}d6kh1` : `1d20 - ${-boon}d6kh1`;

    // Deduce the item
    let item = fromUuidSync(ability_uuid);

    // Setup context
    let doc = null;
    if (item) {
        doc = new TJSDocument(item.actor);
        setContext("tjs_doc", doc);
        setContext("tjs_item", doc);
    }
    if (item?.actor) setContext("tjs_actor", new TJSDocument(item.actor));

    let choice = item?.system.choices[choice_index] ?? null;

    // Defaults for our nodes etc
    let attack_roll_nodes;
    $: attack_roll_nodes = [new Node({ text: "Attack: " }), new Node({ formula: attack_roll_formula })];
</script>

<div class="icon flexcol">
    {#if item}
        <h3>{item.name}</h3>
        {#if choice?.is_attack}
            <NodeSequence initial_nodes={attack_roll_nodes} key={`${msg.id}_to_hit`} />
        {/if}

        {#if choice}
            <AbilityDetail {choice} key={`${msg.id}_body`} />
        {:else}
            <span>Error: Ability choice could not be resolved</span>
        {/if}
    {:else}
        Item deleted
    {/if}
</div>
