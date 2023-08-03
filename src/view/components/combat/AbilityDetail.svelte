<script>
    import HydratedEffectBlock from "../generic/HydratedEffectBlock.svelte";
    import SummonDetail from "./SummonDetail.svelte";

    // An ability choice
    export let choice;
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

        {#if choice.ability.system.chapter == 2}
            | Chapter Ⅱ
        {:else if choice.ability.system.chapter == 3}
            | Chapter Ⅲ
        {/if}
    </span>
    <span>
        <HydratedEffectBlock body={[...choice.ranges, ...choice.tags].join(", ")} />
    </span>
    {#each choice.effects as effect}
        <HydratedEffectBlock body={effect} />
    {/each}
    {#each choice.ability.system.summons as summon}
        {#await fromUuid(summon)}
            <span>Summon...</span>
        {:then summonDoc} 
            <span>Summon: <SummonDetail summon={summonDoc} /></span>
        {:catch}
            Failed to lookup summon {summon} 
        {/await}
    {/each}
</div>

<style lang="scss">
    .title {
        font-weight: bold;
    }
</style>
