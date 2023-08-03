<script>
    import HydratedEffectBlock from "../generic/HydratedEffectBlock.svelte";

    // A summon. Though this might be an odd choice, explicitly NOT a tjs document!
    export let summon;
</script>

<span class="title">
    {summon.name}
</span>

<style lang="scss">
    .title {
        font-weight: bold;
    }
</style>
