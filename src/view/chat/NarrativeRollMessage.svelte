<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { localize } from "../../util/misc";

    // import { fly, fade } from "svelte/transition";

    /** @type {ChatMessage} */
    export let msg;

    /** @type {object} */
    export let roll_json;

    /** 
     * The position the roll was rolled with, or null
     * @type {null | "Risky" | "Controlled" | "Desperate"} 
     */
    export let position;

    /** 
     * The effect the roll was rolled with, or null
     * @type {null | "None" | "Limited" | "Standard" | "Great" | "Super"} 
     */
    export let effect;

    /** 
     * The narrative roll subtype
     * @type {"Action" | "Fortune"} 
     */
    export let subtype;

    /** 
     * The rolling actor's UUID, or null
     * @type {string} 
     */
    export let actor_uuid;

    // Hydrate things. Don't expect these to change
    /** @type {Roll} */
    let roll = new Roll(roll_json);

    /** @type {IconActor | null} */
    let actor = fromUuidSync(actor_uuid)

    // Helpers for the roll
    function resultMessage() {
        let can_crit = roll.formula.includes("kh"); // kl forbids critting
        let crit = can_crit && roll.dice[0].values.filter(x => x == 6).length >= 2; // >= 2 sixes => crit!
        let total = roll.total;
        let pos_string = position ? `${position}.` : "";
        if (crit) {
            return localize(`Icon.Rolls.Narrative.Result.${subtype}.${pos_string}66`);
        } else if (total == 6) {
            return localize(`Icon.Rolls.Narrative.Result.${subtype}.${pos_string}6`);
        } else if (total >= 4) {
            return localize(`Icon.Rolls.Narrative.Result.${subtype}.${pos_string}45`);
        } else {
            return localize(`Icon.Rolls.Narrative.Result.${subtype}.${pos_string}123`);
        }
    }
</script>

<div class="icon flexcol">
    Hello 
    {effect}
    {resultMessage()}
</div>

<style lang="scss">

</style>
