<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { localize } from "../../util/misc";
    import AbilityDetail from "../components/combat/AbilityDetail.svelte";
    import TokenSequence from "../components/generic/TokenSequence.svelte";
    import RollToolTip from "../components/generic/dice/MediumRoll.svelte";

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

    let item = fromUuidSync(ability_uuid);

    /** @type {IconActor | null} */
    let actor = fromUuidSync(actor_uuid);
</script>

<div class="icon flexcol">
    <TokenSequence tokens={tokens.a} unique_id="a" />
    <span>Error resolving ability</span>
</div>

<style lang="scss">
</style>
