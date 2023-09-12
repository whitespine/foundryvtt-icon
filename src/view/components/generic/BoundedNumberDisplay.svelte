<script>
    import { getContext } from "svelte";
    import { resolveDotpath } from "../../../util/paths";
    import { updateDoc } from "../../actions/update";

    /** @type {string} Label to show */
    export let name;

    /** @type {string} Path within doc */
    export let path;

    /** @type {boolean} Can we edit the max val? */
    export let edit_max = false;

    let percent;
    $: percent = Math.round(resolveDotpath($doc, `${path}.value`) / resolveDotpath($doc, `${path}.max`) * 100);

    export let doc = getContext("tjs_actor");
</script>

<div style="background: linear-gradient(to right, var(--secondary-background) {percent}%, #00000000 {percent}%)">
    <span>{name}</span>
    <input type="number" use:updateDoc={{ doc, path: `${path}.value` }} on:click|stopPropagation />
    <span> / </span>
    {#if edit_max}
        <input type="number" use:updateDoc={{ doc, path: `${path}.max` }} on:click|stopPropagation />
    {:else}
        <span>{resolveDotpath($doc, `${path}.max`)}</span>
    {/if}
</div>


<style lang="scss">
    div {
        display: grid;
        grid-template-columns: 1fr 30px 10px 25px;
        align-items: center;
        text-align: center;
        border: var(--primary-border);
        border-radius: 10px;
        padding: 2px;
        margin: 2px;
    }
</style>
