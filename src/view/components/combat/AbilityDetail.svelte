<script>
    import RichTextDisplay from "../generic/RichTextDisplay.svelte";
    import ActorUUIDReference from "./ActorUUIDReference.svelte";

    // An ability choice
    export let choice;

    // For token persistence
    export let key;
</script>

<div {...$$restProps}>
    <span class="title">
        {choice.name}

        {#if choice.actions == 0}
            | Free Action
        {:else if choice.actions == 1}
            | 1 Action
        {:else if choice.actions == 2}
            | 2 Actions
        {/if}

        {#if choice.resolve}
            | {choice.resolve} Resolve
        {/if}

        {#if choice.combo === 1}
            | +Combo
        {:else if choice.combo === -1}
            | -Combo
        {/if}

        {#if choice.ability.system.chapter == 2}
            | Chapter Ⅱ
        {:else if choice.ability.system.chapter == 3}
            | Chapter Ⅲ
        {/if}
    </span>
    <span>
        <RichTextDisplay body={[...choice.ranges, ...choice.tags].join(", ")} key={`${key}_tags`} />
    </span>
    {#each choice.effects as effect, i}
        <RichTextDisplay body={effect} key={`${key}_body_${i}`} />
    {/each}
    {#each choice.summons as summon}
        <span>Summon: <ActorUUIDReference uuid={summon} /></span>
    {/each}
</div>

<style lang="scss">
    .title {
        font-weight: bold;
    }
</style>
