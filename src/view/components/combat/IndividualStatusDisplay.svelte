<script>
    import { ICON } from "../../../consts";
    import { saveAgainst } from "../../../config/statuses";

    export let status = null;

    // Is the effect saveable? (+)
    let saveable;
    $: saveable = status?.getFlag(game.system.id, ICON.flags.status_saveable) ?? false;

    // Is the effect ongoing? (+)
    let ongoing;
    $: ongoing = status?.getFlag(game.system.id, ICON.flags.status_ongoing) ?? false;

    function toggleOngoing() {
        status?.setFlag(game.system.id, ICON.flags.status_ongoing, !ongoing);
    }

    // What is the statuscounter module current counter? Or, null if it doesn't exist
    let count;
    $: count = status?.getFlag("statuscounter", "counter")?.value ?? 1;

    // Is the effect one we should show a counter for?
    let show_counter;
    $: show_counter =
        (status?.getFlag(game.system.id, ICON.flags.status_counter) === true) ||
        (status?.getFlag("statuscounter", "counter")?.visible === true);

    // Definition if we can grab it
    let definition;
    $: definition = status?.description ?? "No description";

    // Post it in chat
    function post() {
        ChatMessage.create({
            content: `<strong>${status?.name}</strong>  ${definition}`,
        });
    }

    // Increment or decrement counter
    async function changeCounter(amount) {
        let prior = foundry.utils.duplicate(status.getFlag("statuscounter", "counter")) ?? {
            actorId: status.parent.id,
            path: status.img,
            tokenId: status.parent.token.id,
            type: "statuscounter.simple",
            value: count,
        };
        prior.value += amount;
        prior.visible = true;
        if(prior.value < 0) {
            // Makes cleanup slightly easier to delete when negative
            await status.delete();
        } else {
            // Otherwise just update the status
            await status.setFlag("statuscounter", "counter", prior);
        }
    }
</script>

<div class="status">
    <img src={status?.img} />
    <span data-tooltip={definition}>
        {status?.name ?? "ERROR"}
        {#if ongoing}
            (+)
        {/if}
    </span>

    <div class="controls">
        <i on:click={() => status?.delete()} class="clickable fas fa-trash" data-tooltip="Delete" />
        <i
            on:click={() => status?.sheet?.render(true, { focus: true })}
            class="clickable fas fa-edit"
            data-tooltip="Edit"
        />
        <i on:click={post} class="clickable fas fa-comment" data-tooltip="Post" />
        {#if saveable}
            <!-- svelte-ignore missing-declaration -->
            <i on:click={toggleOngoing} class="clickable fas fa-circle-plus" data-tooltip="Make Ongoing" />
            <!-- svelte-ignore missing-declaration -->
            {#if !ongoing}
                <i on:click={() => saveAgainst(status)} class="fas fa-dice" data-tooltip="Roll Save" />
            {/if}
        {/if}
        {#if show_counter}
            <div class="counter-controls">
                <i class="clickable fas fa-circle-chevron-left" on:click={() => changeCounter(-1)} />
                <!--on:click={increaseCounter}-->
                <span>{count}</span>
                <i class="clickable fas fa-circle-chevron-right" on:click={() => changeCounter(1)}/>
                <!--on:click={increaseCounter}-->
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .status {
        display: grid;
        grid-template-columns: 48px 1fr 150px;
        grid-auto-flow: dense;

        align-items: center;

        .controls {
            display: flex;
            flex-direction: row-reverse;

            .counter-controls {
                i {
                    margin-left: 0px;
                }
                span {
                    display: inline-block;
                    width: 10px;
                    text-align: center;
                }
            }
        }

        i {
            margin-left: 5px;
        }

        img {
            width: 24px;
            height: 24px;
        }
    }
</style>
