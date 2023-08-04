<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { localize } from "../../util/misc";
    import AbilityDetail from "../components/combat/AbilityDetail.svelte";
    import RollToolTip from "../components/generic/dice/MediumRoll.svelte";

    // import { fly, fade } from "svelte/transition";

    /** @type {ChatMessage} */
    // svelte-ignore unused-export-let
    export let msg;

    /** Attack roll.toJSON(), if has "Hit"
     * @type {object | null} 
     */
    export let attack_roll_data = null;


    /** All embedded roll.toJSON()s
     * @type {Array<object>} 
     */
    export let embedded_roll_datas = [];

    /** 
     * The ability's UUID, or null
     * @type {string} 
     */
    export let ability_uuid;

    /** 
     * The ability's choice index
     * @type {number} 
     */
    export let choice_index;

    let item = fromUuidSync(ability_uuid);
    let choice = item?.system.choices[choice_index];

    // Hydrate things. Don't expect these to change
    /** @type {Roll} */
    let attack_roll = attack_roll ? Roll.fromData(attack_roll) : null;

    /** @type {Array<Roll>} */
    let embedded_rolls = embedded_roll_datas.map(r => Roll.fromData(r));

    /** @type {IconActor | null} */
    let actor = fromUuidSync(actor_uuid)

    let header = localize(`ICON.Rolls.Narrative.Result.Brief.${suffix}`);
    let pos_string = position ? `${position}.` : "";
    let body = localize(`ICON.Rolls.Narrative.Result.${subtype}.${pos_string}${suffix}`);
</script>

<div class="icon flexcol">
    {#if choice}
        {#if attack_roll}
            <RollToolTip roll={attack_roll} />
        {/if}
        <AbilityDetail choice={choice} />
    {:else}
        <span>Error resolving ability</span>
    {/if}
</div>

<style lang="scss">

</style>
