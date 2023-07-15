<script>
    /** @type {Array<{label: string, key: string}>} */
    export let tabs;

    // Currently selected tab. Can be controlled programatically
    export let selected: string;
</script>

<div class="icon-tabs">
    {#each tabs as tab}
        <div class="icon-tab" class:active={selected == tab.key} on:click={() => selected=tab.key}>
            {tab.label}
        </div>
    {/each}
</div>

<style lang="scss">
.icon-tabs {
  clip-path: polygon(15px 0, calc(100%-15px) 0, 100% 15px, 100% 15px, 100% calc(100%-15px), calc(100%-15px) 100%, 15px 100%, 0 calc(100%-15px), 0 15px);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  background-color: var(--main-theme-color, fuchsia);
  color: white;
  padding: 5px 5px;
  min-height: max-content;
  align-items: center;
}

.icon-tab {
  clip-path: polygon(15px 0, calc(100%-15px) 0, 100% 15px, 100% 15px, 100% calc(100%-15px), calc(100%-15px) 100%, 15px 100%, 0 calc(100%-15px), 0 15px);
  padding: 10px;
  cursor: pointer;

  &.selected {
    background-color: orange;
  }
}
</style>