<svelte:options accessors={true} />

<script>
    import { setContext } from "svelte";
    import { TJSApplicationShell } from "#runtime/svelte/component/core";
    // import DocStringField from "../../components/DocStringField.svelte";
    import { scale } from "svelte/transition";
    import PlayerSheet from "./PlayerSheet.svelte";

    export let elementRoot = void 0;

    /** @type {TJSDocument<IconActor>} */
    export let actor;

    // For anything deeper than root doc
    setContext("tjs_actor", actor);
</script>

<TJSApplicationShell bind:elementRoot transition={scale} transitionOptions={{ duration: 1000 }}>
    <PlayerSheet/>
</TJSApplicationShell>

<style lang="scss">
 
</style>
