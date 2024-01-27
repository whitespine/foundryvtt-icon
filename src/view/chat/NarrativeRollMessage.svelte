<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
    import { localize } from "../../util/misc";

    // import { fly, fade } from "svelte/transition";

    /** @type {ChatMessage} */
    export let msg;
    let tjs_msg = new TJSDocument(msg);
    let flags;
    $: flags = $tjs_msg.flags[game.system.id] ?? {};

    // Hydrate things. Don't expect these to change
    /** @type {Roll} */
    let roll;
    $: roll = Roll.fromData(flags.roll_data);

    /** @type {IconActor | null} */
    let actor;
    $: actor = fromUuidSync(flags.actor_uuid);

    // Helpers for the roll
    let total, can_crit, crit, suffix, header, pos_string, body;
    $: {
        total = roll.total;
        can_crit = roll.formula.includes("kh"); // kl forbids critting
        crit = can_crit && roll.dice[0].results.filter((x) => x.result == 6).length >= 2; // >= 2 sixes => crit!
        if (crit) {
            suffix = "66";
        } else if (total == 6) {
            suffix = "6";
        } else if (total >= 4) {
            suffix = "45";
        } else {
            suffix = "123";
        }

        header = localize(`ICON.Rolls.Narrative.Result.Brief.${suffix}`);
        pos_string = flags.position ? `${flags.position}.` : "";
        body = localize(`ICON.Rolls.Narrative.Result.${flags.subtype}.${pos_string}${suffix}`);
    }
</script>

<div class="icon flexcol">
    {#if flags.purpose}
        <p>
            <strong>Goal:</strong>
            {flags.purpose}
        </p>
    {/if}
    {#if flags.position || flags.effect}
        <h2>{flags.position ?? "Risky"} {flags.effect ?? "Standard"}</h2>
    {/if}
    {#await roll.getTooltip()}
        roll.total
    {:then tooltip}
        {@html tooltip}
    {:catch error}
        err
    {/await}
    <h2>{header}</h2>
    <hsep />
    <p>
        {body}
    </p>
</div>

<style lang="scss">
</style>
