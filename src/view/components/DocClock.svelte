<script>
    import { getContext } from "svelte";
    import Clock from "./Clock.svelte";
    import { resolveDotpath } from "../../util/paths";

    /** @type {string} */
    export let path;

    let actor = getContext("tjs_actor");

    let clock;
    $: clock = resolveDotpath($actor, path);

    function handleChange(event) {
        console.log(event);
        $actor.update({[`${path}.value`]: event.detail});
    }
</script>

<Clock value={clock.value} size={clock.size} on:change={handleChange} >
</Clock>


