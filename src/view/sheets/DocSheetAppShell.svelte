<svelte:options accessors={true} />

<script>
    import { setContext } from "svelte";
    import { TJSApplicationShell } from "#runtime/svelte/component/core";
    // import DocStringField from "../../components/DocStringField.svelte";
    import { scale } from "svelte/transition";
    import PlayerSheet from "./PlayerSheet.svelte";

    export let elementRoot = void 0;

    /** @type {TJSDocument<IconActor | IconItem>} */
    export let tjs_doc;

    // For anything deeper than root doc
    setContext("tjs_actor", tjs_doc); // TODO: conditional on tjs item
    setContext("tjs_item", tjs_doc); // TODO: Only if an item
    setContext("tjs_doc", tjs_doc); // Always the root doc
</script>

<TJSApplicationShell bind:elementRoot transition={scale} transitionOptions={{ duration: 200 }}>
    <PlayerSheet/>
</TJSApplicationShell>

<style lang="scss">
 
</style>
