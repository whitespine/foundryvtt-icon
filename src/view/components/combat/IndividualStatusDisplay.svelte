<script>
    import { getContext } from "svelte";
    import { ICON } from "../../../consts";

    export let status;

    // Save against an active effect
    async function saveAgainst() {
        let roll = new Roll("1d20");
        await roll.roll();
        let value = roll.total;
        if (value >= 10) {
            await ae.delete();
            ui.notifications.info(`Succeeded on save with a ${value}`);
        } else {
            ui.notifications.info(`Failed on save with a ${value}`);
        }
    }

    // Is the effect ongoing? (+)
    let ongoing;
    $: ongoing = status.getFlag(game.system.id, ICON.flags.status_ongoing);

    function setOngoing(v) {
        status.setFlag(game.system.id, ICON.flags.status_ongoing, v);
    }

    // What is the statuscounter module current counter? Or, null if it doesn't exist
    let count;
    $: count = status.getFlag("statuscounter", "counter")?.value ?? 1;

    // Is the effect one we should show a counter for?
    let show_counter;
    $: show_counter = false;

    // Definition if we can grab it
    let definition;
</script>

<div class="statuses">
    <img src={status.img} />
    <span>
        {status.name}
        {#if ongoing}
            (+)
        {/if}
        {#if show_counter}
            {count}
        {/if}
    </span>

    <i on:click={() => status.delete()} class="fas fa-trash" data-tooltip="Delete" />
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template-columns: 48px 1fr repeat(1, 24px);
        grid-auto-flow: dense;

        align-items: center;

        i,
        strong {
            cursor: pointer;
        }

        img {
            width: 24px;
            height: 24px;
        }
    }
</style>
