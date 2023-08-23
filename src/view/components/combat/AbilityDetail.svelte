<script>
    import RichTextDisplay from "../generic/RichTextDisplay.svelte";
    import ActorUUIDReference from "./ActorUUIDReference.svelte";

    // An ability choice
    export let choice;
</script>

<div {...$$restProps}>
    <div class="title">
        <h3>{choice.name}</h3>
        <span>
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
    </div>
    <span>
        <RichTextDisplay body={[...choice.ranges, ...choice.tags].join(", ")} />
    </span>
    {#each choice.effects as effect, i}
        <RichTextDisplay body={effect} />
    {/each}
    {#each choice.ability.system.talents as talent, i}
        {#if talent.unlocked}
            <RichTextDisplay body={talent.text} />
        {/if}
    {/each}
    {#if choice.ability.system.mastery}
        <RichTextDisplay body={choice.ability.system.mastery.text} />
    {/if}
    {#each choice.summons as summon}
        <span>Summon: <ActorUUIDReference uuid={summon} /></span>
    {/each}
</div>

<style lang="scss">
    .title {
        display: flex;
        align-items: center;
        font-weight: bold;
        h3 {
            margin-bottom: 0px;
            margin-right: 5px;
        }
        margin-bottom: 5px;
    }
</style>
