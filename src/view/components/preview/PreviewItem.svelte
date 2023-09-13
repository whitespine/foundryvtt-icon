<script>
    import { slide } from "svelte/transition";
    import { dragAsDoc } from "../../actions/drag";
    import { UUIDDocumentStore } from "../../../util/stores/uuid";

    /** @type {string}*/
    export let uuid;

    /**
     * @type {"large" | "medium" | "small"} The UI sizing
     */
    export let size = "large";

    let doc = new UUIDDocumentStore(null);
    $: $doc = uuid;

    let expanded = false;
</script>

<div class="root {size}">
    {#if $doc}
        <div
            class="header"
            on:click={() => (expanded = !expanded)}
            data-uuid={uuid}
            draggable="true"
            use:dragAsDoc={{ doc: $doc }}
            on:contextmenu|preventDefault={$doc.sheet.render(true, { focus: true })}
        >
            <img class="icon" src={$doc.img} />
            <span>
                <slot name="title" doc={$doc} tjs_doc={doc}>
                    {$doc.name}
                </slot>
            </span>
            <div class="controls">
                <slot name="controls" doc={$doc} tjs_doc={doc} />
            </div>
        </div>
        {#if expanded}
            <div class="description" transition:slide>
                <slot name="content" doc={$doc} tjs_doc={doc} />
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

        .header {
            cursor: pointer;
            font-weight: bold;
            align-items: center;
            display: flex;
            flex-direction: row;
        }

        &.large .icon {
            width: 64px;
            height: 64px;
        }

        &.medium .icon {
            width: 32px;
            height: 32px;
        }

        &.small .icon {
            width: 1em;
            height: 1em;
        }

        span {
            margin-left: 5px;
        }
        i {
            cursor: pointer;
            margin-right: 5px;
        }

        .controls {
            margin-left: auto;
            margin-right: 5px;
        }
    }
</style>
