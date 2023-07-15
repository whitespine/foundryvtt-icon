<svelte:options accessors={true} />

<script>
    import { setContext } from "svelte";
    import { TJSApplicationShell } from "#runtime/svelte/component/core";
    // import DocStringField from "../../components/DocStringField.svelte";
    import { scale } from "svelte/transition";
    import PlayerSheet from "./PlayerSheet.svelte";

    export let elementRoot = void 0;

    /** @type {Readable<IconActor>} */
    export let actor_store;

    // For anything deeper than root doc
    setContext("actor_store", actor_store);
</script>

<TJSApplicationShell bind:elementRoot transition={scale} transitionOptions={{ duration: 1000 }}>
    <PlayerSheet actor={$actor_store} />
</TJSApplicationShell>

<style lang="scss">
 
</style>
