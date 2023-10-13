<script>
    import { ICON } from "../../../consts";
    import { saveAgainst } from "../../../config/statuses";

    export let status;

    // Is the effect saveable? (+)
    let saveable;
    $: saveable = status.getFlag(game.system.id, ICON.flags.status_saveable);

    // Is the effect ongoing? (+)
    let ongoing;
    $: ongoing = status.getFlag(game.system.id, ICON.flags.status_ongoing);

    function toggleOngoing() {
        status.setFlag(game.system.id, ICON.flags.status_ongoing, !ongoing);
    }

    // What is the statuscounter module current counter? Or, null if it doesn't exist
    let count;
    $: count = status.getFlag("statuscounter", "counter")?.value ?? 1;

    // Is the effect one we should show a counter for?
    let show_counter;
    $: show_counter = false;

    // Definition if we can grab it
    let definition;
    $: definition = status.description ?? "No description";

    // Post it in chat
    function post() {
        ChatMessage.create({
            content: `<strong>${status.name}</strong>  ${definition}`,
        });
    }
</script>

<div class="status">
    <img src={status.img} />
    <span data-tooltip={definition}>
        {status.name}
        {#if ongoing}
            (+)
        {/if}
        {#if show_counter}
            {count}
        {/if}
    </span>

    <div class="controls">
        <i on:click={() => status.delete()} class="fas fa-trash" data-tooltip="Delete" />
        <i on:click={() => status.sheet?.render(true, { focus: true })} class="fas fa-edit" data-tooltip="Edit" />
        <i on:click={post} class="fas fa-comment" data-tooltip="Post" />
        {#if saveable}
            <!-- svelte-ignore missing-declaration -->
            <i
                on:click={toggleOngoing}
                class="fas fa-circle-plus"
                data-tooltip="Make Ongoing"
            />
            <!-- svelte-ignore missing-declaration -->
            {#if !ongoing}
                <i on:click={() => saveAgainst(status)} class="fas fa-dice" data-tooltip="Roll Save" />
            {/if}
        {/if}
    </div>
</div>

<style lang="scss">
    .status {
        display: grid;
        grid-template-columns: 48px 1fr 120px;
        grid-auto-flow: dense;

        align-items: center;

        .controls {
            display: flex;
            flex-direction: row-reverse;
        }

        i {
            cursor: pointer;
            margin-left: 5px;
        }

        img {
            width: 24px;
            height: 24px;
        }
    }
</style>
