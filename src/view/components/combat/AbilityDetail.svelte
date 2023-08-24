<script>
    import { createEventDispatcher } from "svelte";
    import RichTextDisplay from "../generic/RichTextDisplay.svelte";
    import ActorUUIDReference from "./ActorUUIDReference.svelte";

    // An ability choice
    export let choice;

    /** An optional object store */
    export let overrides = {};

    const dispatch = createEventDispatcher();

    // Tag a savenode with a key
    function requestPersist(key, node) {
        dispatch("savenode", [key, node]);
    }
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
        <RichTextDisplay
            body={[...choice.ranges, ...choice.tags].join(", ")}
            node_override={overrides["tags"] ?? null}
            on:savenode={(e) => requestPersist("tags", e.detail)}
        />
    </span>
    {#each choice.effects as effect, i}
        <RichTextDisplay
            body={effect}
            node_override={overrides[`effect_${i}`] ?? null}
            on:savenode={(e) => requestPersist(`effect_${i}`, e.detail)}
        />
    {/each}
    {#each choice.ability.system.talents as talent, i}
        {#if talent.unlocked}
            <RichTextDisplay
                body={talent.text}
                node_override={overrides[`talent_${i}`] ?? null}
                on:savenode={(e) => requestPersist(`talent_${i}`, e.detail)}
            />
        {/if}
    {/each}
    {#if choice.ability.system.mastery}
        <RichTextDisplay
            body={choice.ability.system.mastery.text}
            node_override={overrides["mastery"] ?? null}
            on:savenode={(e) => requestPersist("mastery", e.detail)}
        />
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
