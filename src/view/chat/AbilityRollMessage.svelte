<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { Token } from "../../util/nlp";
    import TokenSequence from "../components/generic/TokenSequence.svelte";

    // import { fly, fade } from "svelte/transition";

    /** @type {ChatMessage} */
    // svelte-ignore unused-export-let
    export let msg;

    /**
     * The ability's UUID, or null
     * @type {string}
     */
    export let ability_uuid;

    /**
     * Any editable token sequences embedded in this roll
     * @type {Record<string, Token>[]}
     */
    export let tokens;

    // Deduce the item
    let item;
    $: item = fromUuidSync(ability_uuid);

    // Defaults for our tokens etc
    let default_attack_roll_token = [
        new Token({
            children: [
                {
                    text: "Hit: ",
                },
                {
                    formula: "1d20",
                },
            ],
        }),
    ];
</script>

<div class="icon flexcol">
    <h3>{item.name}</h3>
    {#if true}
        <TokenSequence tokens={tokens.to_hit || default_attack_roll_token} unique_id="to_hit" />
    {/if}
    <!--<TokenSequence tokens={tokens.body || item.} unique_id="body" />-->
</div>

<style lang="scss">
</style>
