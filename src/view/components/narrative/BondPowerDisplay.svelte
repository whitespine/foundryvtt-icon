<script>
    import { slide } from "svelte/transition";
    import { TJSDialog } from "#runtime/svelte/application";
    import { dragAsDoc } from "../../actions/drag";
    /** @type {TJSDocument<IconItem>}*/
    export let power;

    let expanded = false;

    function sendToChat(evt) {
        evt.stopPropagation();
        ChatMessage.create({
            content: `${power.name}<br>${power.system.description}`,
        });
    }

    /** Deletes the selected item. choices are deleted individually first. */
    function promptDelete() {
        TJSDialog.confirm({
            content: `Delete ${power.name}?`,
            onYes: () => power.delete(),
        });
    }
</script>

<div class="root">
    <div
        class="header"
        on:click={() => (expanded = !expanded)}
        data-uuid={power.uuid}
        draggable="true"
        use:dragAsDoc={{ doc: power }}
    >
        <img class="icon hover" src="icons/skills/social/diplomacy-writing-letter.webp" />
        <img class="icon cover" src={power.img} on:click={sendToChat} />
        <span>{power.name}</span>
    </div>
    {#if expanded}
        <div class="description" transition:slide>
            <div>{@html power.system.description}</div>
            <div style="float: right">
                <i class="fas fa-edit" on:click={power.sheet.render(true, { focus: true })} />
                <i class="fas fa-trash" on:click={promptDelete} />
            </div>
        </div>
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
        grid-template: 30px 1fr / 1fr;
    }
    .header {
        cursor: pointer;
        font-weight: bold;
        align-items: center;
        display: flex;
        flex-direction: row;
        .icon {
            width: 24px;
            height: 24px;
            transition: opacity 0.3s;
            &.cover:hover {
                opacity: 0%;
            }
            &.cover {
                margin-left: -24px;
            }
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
