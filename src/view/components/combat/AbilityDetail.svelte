<script>
    import HydratedEffectBlock from "../generic/HydratedEffectBlock.svelte";

    // Either an ability choice or a trait
    export let choice;
    let cost;
</script>

<div>
    <span class="title">
        {choice.name} |

        {#if choice.actions == 0}
            Free Action
        {:else if choice.actions == 1}
            1 Action
        {:else if choice.actions == 2}
            2 Actions
        {/if}

        {#if choice.resolve}
            | {choice.resolve} Resolve
        {/if}
    </span>
    <span>
        <HydratedEffectBlock body={[...choice.ranges, ...choice.tags].join(", ")} />
    </span>
    {#each choice.effects as effect}
        <HydratedEffectBlock body={effect} />
    {/each}
</div>

<style lang="scss">
    .title {
        font-weight: bold;
    }
</style>
