<script>
    import { setContext } from "svelte";
    import * as harm from "../../util/harm";
    import HarmManifestEntry from "../components/combat/HarmManifestEntry.svelte";
    import { simpleUnslugifyObject } from "../actions/util";
    import { showHarmApplication } from "../../util/harm";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

    /** @type {ChatMessage} */
    export let msg;
    let tjs_msg;
    $: tjs_msg = new TJSDocument(msg);
    let flags;
    $: flags = $tjs_msg.flags[game.system.id] ?? {};

    /**
     * The displayed harm manifest, un-slugified
     * @type {harm.HarmManifest}
     */
    let fixed_manifest;
    $: fixed_manifest = simpleUnslugifyObject(flags.harm_manifest);
</script>

<div class="icon flexcol">
    <h1 on:click={showHarmApplication}>
        Damage Planner
        <i class="fas fa-spider" />
    </h1>
    {#each Object.entries(fixed_manifest) as [actor_uuid, records]}
        <HarmManifestEntry actor_uuid={actor_uuid} records={records} />
    {/each}
</div>

<style lang="scss">
    h1 {
        cursor: pointer;
    }
    </style>