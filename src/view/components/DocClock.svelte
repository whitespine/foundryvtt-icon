<script>
    import { getContext } from "svelte";
    import Clock from "./Clock.svelte";
    import { resolveDotpath } from "../../util/paths";
    import { updateDoc } from "../actions/update";

    /** @type {string} Path to the clock*/
    export let path;

    /** @type {boolean} Should the name be an input? */
    export let title_editable = true;

    let actor = getContext("tjs_actor");


    let clock;
    $: clock = resolveDotpath($actor, path);

    function handleChange(event) {
        console.log(event);
        $actor.update({[`${path}.value`]: event.detail});
    }
</script>

<div>
    {#if title_editable}
        <input type="text" use:updateDoc={{doc: actor, path: `${path}.name`}} />
    {:else}
        <span>{clock.name}</span>
    {/if}
    <Clock value={clock.value} size={clock.size} on:change={handleChange} >
    </Clock>
</div>

<style lang="scss">
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>


