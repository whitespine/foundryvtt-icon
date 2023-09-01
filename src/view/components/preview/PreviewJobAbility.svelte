<script>
    import { slide } from "svelte/transition";
    import { dragAsDoc } from "../../actions/drag";
    import AbilityDetail from "../combat/AbilityDetail.svelte";
    import { UUIDDocumentStore } from "../../../util/stores";

    /** @type {string}*/
    export let uuid;

    let ability = new UUIDDocumentStore(null);
    $: $ability = uuid;

    let expanded = false;
    function toggleExpanded() {
        expanded = !expanded;
    }
</script>

<div class="root">
    {#if $ability}
        <div
            class="header"
            on:click={() => (expanded = !expanded)}
            data-uuid={uuid}
            draggable="true"
            use:dragAsDoc={{ doc: $ability }}
        >
            <img class="icon" src={$ability.img} />
            <span>{$ability.name}</span>
            <div style="margin-left: auto">
                <slot name="controls">
                    <i class="fas fa-edit fa-xl" on:click={$ability.sheet.render(true, { focus: true })} />
                </slot>
            </div>
        </div>
        {#if expanded}
            <div class="description" transition:slide>
                {#each $ability.system.choices as choice}
                    <AbilityDetail {choice} />
                {/each}
                <div style="float: right">
                </div>
            </div>
        {/if}
    {:else}
            ERROR {uuid}
    {/if}
</div>

<style lang="scss">
    .root {
        display: flex;
        flex-direction: column;
        border: var(--primary-border);
        border-radius: 10px;
        padding: 5px;
        margin: 2px;
        grid-template: 64px 1fr / 1fr;
    }
    .header {
        cursor: pointer;
        font-weight: bold;
        align-items: center;
        display: flex;
        flex-direction: row;
        .icon {
            width: 64px;
            height: 64px;
        }
        span {
            margin-left: 5px;
        }
    }
    i {
        cursor: pointer;
        margin-right: 5px;
    }
</style>
