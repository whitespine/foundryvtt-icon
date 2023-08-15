<script>
    import { ICON } from "../../../consts";
    import * as harm from "../../../util/harm";

    /** @type {harm.HarmRecord} */
    export let record;

    // Let the tooltip show how the damage was computed
    let tooltip;
    $: {
        tooltip = `${record.harm.original_amount} damage`;
        if(record.harm.armor_reduction) {
            tooltip += ` → ${record.harm.original_amount - record.harm.armor_reduction} (armor)`;
        }
        if(record.harm.mod) {
            tooltip += ` → ${amount} (${record.harm.mod})`;
        }
    }
</script>

<div>
    <i class="{ICON.css[record.harm.type]}" data-tooltip={record.harm.type} />
    <span data-tooltip={tooltip}>
        {record.harm.amount}
        |
        <i class="{ICON.css.hp}" />
        {record.original_hp} → {record.final_hp}
        {#if record.final_vigor || record.original_vigor}
            |
            <i class="{ICON.css.vigor}" />
            {record.original_vigor} → {record.final_vigor}
        {/if}
    </span>
</div>

<style lang="scss">
    div {
        padding: 2px
    }
</style>
