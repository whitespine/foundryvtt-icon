<script>
    /** @type {Array<{label: string, key: string}>} */
    export let tabs;

    /** @type {boolean} */
    export let horizontal = true;

    // Currently selected tab. Can be controlled programatically
    export let selected;
</script>

<div class="icon-tabs" class:horizontal {...$$restProps}>
    {#each tabs as tab}
        <div class="tab" class:active={selected == tab.key} on:click={() => (selected = tab.key)}>
            {tab.label}
        </div>
    {/each}
</div>

<style lang="scss">
    .icon-tabs {
        clip-path: var(--inset-box-clip);
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        min-height: max-content;
        align-items: center;
    }

    .horizontal {
        flex-direction: row;
    }

</style>
