<script>
    import { ICON } from "../../../consts";
    import * as harm from "../../../util/harm";

    /** @type {harm.HarmRecord} */
    export let record;

    /** @type {boolean} */
    export let obscure;

    // Let the tooltip show how the damage was computed
    let tooltip;
    $: {
        tooltip = `${record.harm.original_amount} ${record.harm.type}`;
        let amount = record.harm.original_amount;
        for(let [cause, delta] of record.harm.deltas) {
            amount += delta;
            tooltip += ` → ${amount} (${delta} ${cause})`;
        }
    }
</script>

<div data-tooltip={tooltip}>
    <span class="amount">
        <i class={ICON.css[record.harm.type]} data-tooltip={record.harm.type} />
        {record.harm.amount}
    </span>
    {#if obscure}
        <span>
            {#if !record.original_bloodied && record.final_bloodied}
                NOW BLOODIED!
            {:else if record.final_bloodied}
                BLOODIED!
            {:else}
                UNKNOWN
            {/if}
        </span>
    {:else}
        <span class="hp">
            <i class={ICON.css.hp} />
            <span>{record.original_hp}</span> → <span>{record.final_hp}</span>
        </span>
        {#if record.final_vigor || record.original_vigor}
            <span class="vigor">
                <i class={ICON.css.vigor} />
                <span>{record.original_vigor}</span> → <span>{record.final_vigor}</span>
            </span>
        {/if}
    {/if}
</div>

<style lang="scss">
    div {
        padding: 0px;
        span {
            display: inline-block;

            span {
                min-width: 24px;
            }
        }
    }

    .amount {
        border-right: var(--primary-border);
        padding-right: 6px;
        min-width: 60px;

        i {
            margin-right: 6px;
        }
    }

    .hp {
        margin: 0px 4px;
        min-width: 80px;
    }

    .vigor {
        padding-left: 6px;
        border-left: var(--primary-border);
    }

    i {
        max-width: 14px;
    }
</style>
