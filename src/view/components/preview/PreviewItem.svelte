<script>
    import { slide } from "svelte/transition";
    import { dragAsDoc } from "../../actions/drag";
    import { UUIDDocumentStore } from "../../../util/stores";

    /** @type {string}*/
    export let uuid;

    let doc = new UUIDDocumentStore(null);
    $: $doc = uuid;

    let expanded = false;
</script>

<div class="root">
    {#if $doc}
        <div
            class="header"
            on:click={() => (expanded = !expanded)}
            data-uuid={uuid}
            draggable="true"
            use:dragAsDoc={{ doc: $doc }}
        >
            <img class="icon" src={$doc.img} />
            <span>
                <slot name="title" doc={$doc}>
                    {$doc.name}
                </slot>
            </span>
            <div style="margin-left: auto">
                <i class="fas fa-edit fa-lg" on:click={$doc.sheet.render(true, { focus: true })} />
                <slot name="controls" />
            </div>
        </div>
        {#if expanded}
            <div class="description" transition:slide>
                <slot name="content" doc={$doc}/>
            </div>
        {/if}
    {:else if uuid}
        ERROR {uuid}
    {:else}
        Undefined. You can probably drag something here
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
