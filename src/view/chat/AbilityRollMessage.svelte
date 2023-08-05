<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { setContext } from "svelte";
    import { Token } from "../../util/nlp";
    import TokenSequence from "../components/generic/TokenSequence.svelte";
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

    // Deduce the item
    let item;
    $: item = fromUuidSync(ability_uuid);

    // Defaults for our tokens etc
    let attack_roll_tokens;
    $: attack_roll_tokens = [
        new Token({ text: "Hit: " }),
        new Token({ formula: "1d20" })
    ];
</script>

<div class="icon flexcol">
    <h3>{item.name}</h3>
    {#if true}
        <TokenSequence initial_tokens={attack_roll_tokens} key={`${msg.id}_to_hit`} />
    {/if}

    {#if choice_index < item.system.choices.length}
        <AbilityDetail choice={item.system.choices[choice_index]} key={`${msg.id}_body`} />
    {:else}
        <span>Error: Ability choice could not be resolved</span>
    {/if}
    <!--<TokenSequence tokens={tokens.body || item.} unique_id="body" />-->
</div>