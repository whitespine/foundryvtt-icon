<script>
    // UUID of an actor
    export let uuid;

    // Open the refActors sheet.
    function openSheet(refActor) {
        refActor.sheet.render(true, { focus: true });
    }

    function setDragData(refActor, evt) {
        evt.stopImmediatePropagation();

        // Try to find an existing world actor if possible alternative
        let alt = game.actors.getName(refActor.name);

        evt.dataTransfer.setData("text/plain", JSON.stringify((alt || refActor).toDragData()));
    }
</script>

{#await fromUuid(uuid)}
    <span>...</span>
{:then refActor}
    <span
        class="inline-container"
        data-uuid={uuid}
        draggable="true"
        on:click={() => openSheet(refActor)}
        on:dragstart={(e) => setDragData(refActor, e)}
    >
        {refActor.name}
    </span>
{/await}

<style lang="scss">
    span {
        font-weight: bold;
        background-color: var(--tertiary-background);
        color: var(--tertiary-color);
        cursor: pointer;
    }
</style>
