<script>
    import HydratedEffectBlock from "../generic/HydratedEffectBlock.svelte";

    // A summon. Though this might be an odd choice, explicitly NOT a tjs document!
    export let summon;

    function openSheet() {
        summon.sheet.render(true, {focus: true});
    }

    function setDragData(evt) {
        evt.stopImmediatePropagation();
        evt.dataTransfer.setData("text/plain", JSON.stringify(summon.toDragData()));
    }
</script>

<span draggable=true on:click={openSheet} on:dragstart={setDragData}>
    {summon.name}
</span>

<style lang="scss">
    span {
        font-weight: bold;
        border-radius: 5px;
        border: var(--primary-border);
        background-color: var(--tertiary-background);
        color: var(--tertiary-color);
        padding: 2px;
        cursor: pointer;
    }
</style>
