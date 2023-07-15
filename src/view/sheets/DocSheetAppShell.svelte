<svelte:options accessors={true} />

<script>
    import { setContext } from "svelte";
    import { TJSApplicationShell } from "#runtime/svelte/component/core";
    // import DocStringField from "../../components/DocStringField.svelte";
    import { scale } from "svelte/transition";
    import PlayerSheet from "./PlayerSheet.svelte";

    export let elementRoot = void 0;

    /** @type {TJSDocument<IconActor | IconItem>} */
    export let doc;

    // For anything deeper than root doc
    setContext("tjs_actor", doc); // TODO: conditional on tjs item
    setContext("tjs_item", doc); // TODO: Only if an item
    setContext("tjs_doc", doc); // Always the root doc
</script>

<TJSApplicationShell bind:elementRoot transition={scale} transitionOptions={{ duration: 1000 }}>
    <PlayerSheet/>
</TJSApplicationShell>

<style lang="scss">
 
</style>
