<svelte:options accessors={true} />

<script>
    import { setContext } from "svelte";
    import { TJSApplicationShell } from "#runtime/svelte/component/core";
    // import DocStringField from "../../components/DocStringField.svelte";
    import { scale } from "svelte/transition";
    import PlayerSheet from "./PlayerSheet.svelte";
    import FoeSheet from "./FoeSheet.svelte";
    import SummonSheet from "./SummonSheet.svelte";
    import AbilitySheet from "./AbilitySheet.svelte";
    import BondSheet from "./BondSheet.svelte";
    import JobSheet from "./JobSheet.svelte";
    import BondPowerSheet from "./BondPowerSheet.svelte";
    import RelicSheet from "./RelicSheet.svelte";

    export let elementRoot = void 0;

    /** @type {TJSDocument<IconActor | IconItem>} */
    export let tjs_doc;

    // For anything deeper than root doc
    setContext("tjs_actor", tjs_doc); // TODO: conditional on tjs item
    setContext("tjs_item", tjs_doc); // TODO: Only if an item
    setContext("tjs_doc", tjs_doc); // Always the root doc
    setContext("unique_prefix", tjs_doc.uuid); // For Node logic
</script>

<TJSApplicationShell bind:elementRoot transition={scale} transitionOptions={{ duration: 100 }}>
    {#if $tjs_doc.type == "player"}
        <PlayerSheet />
    {:else if $tjs_doc.type == "foe"}
        <FoeSheet />
    {:else if $tjs_doc.type == "summon"}
        <SummonSheet />
    {:else if $tjs_doc.type == "ability"}
        <AbilitySheet />
    {:else if $tjs_doc.type == "bond"}
        <BondSheet />
    {:else if $tjs_doc.type == "bond-power"}
        <BondPowerSheet />
    {:else if $tjs_doc.type == "job"}
        <JobSheet />
    {:else if $tjs_doc.type == "relic"}
        <RelicSheet />
    {:else}
        <span>Unsupported doc</span>
    {/if}
</TJSApplicationShell>
