<script>
    import { slide } from "svelte/transition";
    /** @type {TJSDocument<IconItem>}*/
    export let power;

    let expanded = false;
</script>

<div class="root">
    <div class="header" on:click={() => (expanded = !expanded)}>
        <span>{power.name}</span>
    </div>
    {#if expanded}
        <div class="description" transition:slide>{@html power.system.description}</div>
    {/if}
</div>

<style lang="scss">
    .root {
        display: flex;
        flex-direction: column;
        border: 1px solid black;
        border-radius: 10px;
        padding: 5px;
        margin: 2px;
        grid-template: 30px 1fr / 1fr;
    }
    .header {
        cursor: pointer;
        font-weight: bold;
    }
</style>
