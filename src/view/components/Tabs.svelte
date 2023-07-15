<script>
    /** @type {Array<{label: string, key: string}>} */
    export let tabs;

    // Currently selected tab. Can be controlled programatically
    export let selected;
</script>

<div class="icon-tabs">
    {#each tabs as tab}
        <div class="icon-tab" class:active={selected == tab.key} on:click={() => (selected = tab.key)}>
            {tab.label}
        </div>
    {/each}
</div>

<style lang="scss">
    $gap: 5px; 

    .icon-tabs {
        clip-path: polygon(
            $gap 0,
            calc(100% - $gap) 0,
            100% $gap,
            100% $gap,
            100% calc(100% - $gap),
            calc(100% - $gap) 100%,
            $gap 100%,
            0 calc(100% - $gap),
            0 $gap
        );
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        background-color: rgb(56, 52, 56);
        margin: 5px;
        min-height: max-content;
        align-items: center;
    }

    .icon-tab {
        clip-path: polygon(
            $gap 0,
            calc(100% - $gap) 0,
            100% $gap,
            100% $gap,
            100% calc(100% - $gap),
            calc(100% - $gap) 100%,
            $gap 100%,
            0 calc(100% - $gap),
            0 $gap
        );
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
