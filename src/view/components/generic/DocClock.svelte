<script>
    import { getContext } from "svelte";
    import Clock from "./Clock.svelte";
    import { resolveDotpath } from "../../../util/paths";
    import { updateDoc } from "../../actions/update";

    /** @type {string} Path to the clock*/
    export let path;

    /** @type {boolean} Should the name be an input? */
    export let title_editable = true;

    /** @type {string} Size of the clock */
    export let clock_width;

    /** @type {string} Whether to display horizontally */
    export let inline = false;

    /** @type {boolean} Show title at all */
    export let title = false;

    let actor = getContext("tjs_actor");

    let clock;
    $: clock = resolveDotpath($actor, path);

    function handleChange(event) {
        $actor.update({ [`${path}.value`]: event.detail });
    }
</script>

<div class:flexrow={inline} class:flexcol={!inline}>
    {#if title}
        {#if title_editable}
            <input type="text" use:updateDoc={{ doc: actor, path: `${path}.name` }} />
        {:else}
            <span>{clock.name}</span>
        {/if}
    {/if}
    <Clock value={clock.value} size={clock.size} width={clock_width} on:change={handleChange} />
</div>

<style lang="scss">
    div {
        align-items: center;
    }
</style>
