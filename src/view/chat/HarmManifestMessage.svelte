<script>
    import { setContext } from "svelte";
    import * as harm from "../../util/harm";
    import HarmManifestEntry from "../components/combat/HarmManifestEntry.svelte";
    import { simpleUnslugifyObject } from "../../util/misc";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

    /** @type {ChatMessage} */
    export let msg;
    let tjs_msg = new TJSDocument(msg);
    let flags;
    $: flags = $tjs_msg.flags[game.system.id] ?? {};

    setContext("tjs_msg", tjs_msg);

    /**
     * The displayed harm manifest, un-slugified
     * @type {harm.HarmManifest}
     */
    let fixed_manifest;
    $: fixed_manifest = simpleUnslugifyObject(flags.harm_manifest);

    // Sets the actors hp/vigor to match the end of the record
    async function apply() {
        for (let [uuid, records] of Object.entries(fixed_manifest)) {
            let actor = await fromUuid(uuid);
            if (actor) {
                let last_record = records[records.length - 1];
                if (!last_record) continue;
                actor.update({
                    "system.hp.value": last_record.final_hp,
                    "system.vigor.value": last_record.final_vigor,
                });
                $tjs_msg.setFlag(game.system.id, "applied", true);
            }
        }
    }
</script>

<div class="icon flexcol">
    <h2 on:click={harm.showHarmApplication}>
        Damage Planner
        <i class="fas fa-spider fa-sm" />
    </h2>
    {#each Object.entries(fixed_manifest) as [actor_uuid, records]}
        {#if records.length}
            <HarmManifestEntry {actor_uuid} {records} />
        {/if}
    {/each}
    {#if !flags.applied}
        <button on:click={apply}>Apply All</button>
    {/if}
</div>

<style lang="scss">
    h1 {
        cursor: pointer;
    }
</style>
