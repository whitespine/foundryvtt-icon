
<script>
    import { getContext } from "svelte";
    import Clock from "./Clock.svelte";
    import { resolveDotpath } from "../../util/paths";

    /** @type {string} */
    export let path;

    let actor = getContext("tjs_actor");

    let clock = resolveDotpath($actor, path);



</script>

<Clock {...$$props} {...clock} >
</Clock>


<style lang="scss">
</style>
