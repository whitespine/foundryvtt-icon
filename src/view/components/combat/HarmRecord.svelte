<script>
    import { ICON } from "../../../consts";
    import * as harm from "../../../util/harm";
    import { TJSContextMenu } from "#standard/application";
    import { createEventDispatcher } from "svelte";

    /** @type {harm.HarmRecord} */
    export let record;

    /** @type {boolean} */
    export let obscure;

    // Let the tooltip show how the damage was computed
    let tooltip;
    $: {
        tooltip = `${record.harm.original_amount} (${record.harm.dice_result}) ${record.harm.type}`;
        let amount = record.harm.original_amount;
        for (let [cause, delta] of record.harm.deltas) {
            amount += delta;
            tooltip += ` → ${amount} (${delta > 0 ? '+' : ''}${delta} ${cause})`;
        }
    }

    let dispatch = createEventDispatcher();

    function summonEditMenu(event) {
        let items = [];

        // Add a button that removes this entry
        items.push({
            label: "Remove",
            icon: "fas fa-times",
            onPress: () => {
                dispatch("delete");
            },
        });
        items.push({
            separator: "hr"
        });

        // Add buttons to change type
        for (let type of ["damage", "piercing", "divine", "vigor"]) {
            if (record.harm.type === type) continue;
            items.push({
                label: `Change to ${type}`,
                icon: ICON.css[type],
                onPress: (...x) => dispatch("changetype", type),
            });
        }
       items.push({
            separator: "hr"
        });

        // Add buttons to add or remove flags
        for (let flag of ["resistance", "immune", "vulnerable", "shattered", "weakened", "pacified"]) {
            let exists = record.harm.flags.includes(flag);
            items.push({
                label: `${exists ? "-" : "+"}${flag}`,
                icon: ICON.css[flag],
                onPress: () => dispatch("toggleflag", flag),
            });
        }

        // Summon the context menu itself
        TJSContextMenu.create({
            event,
            items,
        });
    }
</script>

<div data-tooltip={tooltip} on:contextmenu|preventDefault|stopPropagation={summonEditMenu}>
    <span class="amount">
        <i class={ICON.css[record.harm.type]} />
        {record.harm.original_amount}
        {#if record.harm.amount !== record.harm.original_amount}
            ({record.harm.amount})
        {/if}
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
    {#if record.harm.flags.length}
        <span class="flags">
            {#each record.harm.flags as flag}
                <i class={ICON.css[flag]} />
            {/each}
        </span>
    {/if}
</div>

<style lang="scss">
    div {
        padding: 0px;
        span {
            display: inline-block;
        }

        &:hover {
            font-weight: bolder;
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
        min-width: 40px;
    }

    .flags {
        padding-left: 6px;
        border-left: var(--primary-border);
    }

    i {
        max-width: 14px;
    }
</style>
