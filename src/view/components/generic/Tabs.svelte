<script>
    /** @type {Array<{label: string, key: string}>} */
    export let tabs;

    /** @type {boolean} */
    export let horizontal = true;

    // Currently selected tab. Can be controlled programatically
    export let selected;
</script>

<div class="icon-tabs" class:horizontal>
    {#each tabs as tab}
        <div class="icon-tab" class:active={selected == tab.key} on:click={() => (selected = tab.key)}>
            {tab.label}
        </div>
    {/each}
</div>

<style lang="scss">
    .icon-tabs {
        clip-path: var(--inset-box-clip);
        display: flex;
        flex-wrap: nowrap;
        justify-content: flex-start;
        background-color: rgb(56, 52, 56);
        margin: 5px;
        min-height: max-content;
        align-items: center;
    }

    .horizontal {
        flex-direction: row;
    }

    .icon-tab {
        clip-path: var(--inset-box-clip);
        margin: 5px;
        padding: 10px;
        cursor: pointer;

        background-color: rgb(98, 84, 58);
        color: white;

        &.active {
            background-color: rgb(225, 235, 90);
            color: black;
        }
    }
</style>
