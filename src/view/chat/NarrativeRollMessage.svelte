<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { localize } from "../../util/misc";

    // import { fly, fade } from "svelte/transition";

    /** @type {ChatMessage} */
    // svelte-ignore unused-export-let
    export let msg;

    /** The roll.toJSON()
     * @type {object} 
     */
    export let roll_data;

    /** The stated purpose of the roll
     * @type {string} 
     */
    export let purpose;

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
    let roll = Roll.fromData(roll_data);

    /** @type {IconActor | null} */
    let actor = fromUuidSync(actor_uuid)

    // Helpers for the roll
    let total = roll.total;
    let can_crit = roll.formula.includes("kh"); // kl forbids critting
    let crit = can_crit && roll.dice[0].values.filter(x => x == 6).length >= 2; // >= 2 sixes => crit!
    let suffix;
    if (crit) {
        suffix = "66";
    } else if (total == 6) {
        suffix = "6";
    } else if (total >= 4) {
        suffix = "45";
    } else {
        suffix = "123";
    }

    let header = localize(`ICON.Rolls.Narrative.Result.Brief.${suffix}`);
    let pos_string = position ? `${position}.` : "";
    let body = localize(`ICON.Rolls.Narrative.Result.${subtype}.${pos_string}${suffix}`);
</script>

<div class="icon flexcol">
    {#if purpose}
    <p>
        <strong>Goal:</strong> {purpose}
    </p>
    {/if}
    {#if position || effect}
        <h2>{position ?? "Risky"} {effect ?? "Standard"}</h2>
    {/if}
    {#await roll.getTooltip()}
        roll.total 
    {:then tooltip}
        {@html tooltip}
    {:catch error}
        err 
    {/await}
    <h2>{header}</h2>
    <hsep></hsep>
    <p>
        {body}
    </p>
</div>

<style lang="scss">

</style>
