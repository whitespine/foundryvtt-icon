<script>
    import * as harm from "../../../util/harm";
    import HarmRecord from "./HarmRecord.svelte";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
    import { getContext } from "svelte";
    import { actorTokenImage } from "../../../util/misc";

    /** @type {string} */
    export let actor_uuid;

    let actor = new TJSDocument(fromUuidSync(actor_uuid) ?? undefined);

    let tjs_msg = getContext("tjs_msg");

    /** @type {harm.HarmRecord[]} */
    export let records;

    /** @type {harm.HarmRecord} */
    let last_record;
    $: last_record = records[records.length - 1];

    /** @type {boolean} */
    let can_apply;
    $: can_apply =
        last_record &&
        !($tjs_msg.getFlag(game.system.id, "applied")?.includes(actor_uuid)) && 
        (last_record.final_hp != $actor?.system.hp.value || last_record.final_vigor != $actor?.system.vigor.value);

    /** @type {boolean} */
    let can_see;
    $: can_see = $actor?.testUserPermission(game.user, "OBSERVER");

    // Sets the actors hp/vigor to match the end of the record
    function apply() {
        $actor.update({
            "system.hp.value": last_record.final_hp,
            "system.vigor.value": last_record.final_vigor,
        });
        let old_applied = $tjs_msg.getFlag(game.system.id, "applied") ?? [];
        $tjs_msg.setFlag(game.system.id, "applied",  [...old_applied, actor_uuid]);
    }

    // Replaces this harm manifest with a new one
    async function updateRecords(new_records) {
        let curr = await harm.getHarmManifest($tjs_msg);
        harm.setHarmManifest($tjs_msg, {
            ...curr,
            [$actor.uuid]: new_records,
        });
    }

    // Delete the harm at the specified index
    function deleteHarm(index) {
        updateRecords([...records.slice(0, index), ...records.slice(index + 1)]);
    }

    // Add specified flag to harm at specified index
    function toggleFlag(index, flag) {
        let old_record = records[index];
        let new_flags = old_record.harm.flags.includes(flag)
            ? old_record.harm.flags.filter((f) => f != flag)
            : [...old_record.harm.flags, flag];
        let new_record = {
            ...old_record,
            harm: {
                ...old_record.harm,
                flags: new_flags,
            },
        };
        updateRecords([...records.slice(0, index), new_record, ...records.slice(index + 1)]);
    }

    // Set the damage type at specified index
    function setType(index, type) {
        let old_record = records[index];
        let new_record = {
            ...old_record,
            harm: {
                ...old_record.harm,
                type,
            },
        };
        updateRecords([...records.slice(0, index), new_record, ...records.slice(index + 1)]);
    }
</script>

<div class="flexcol">
    <div class="header">
        {#if $actor}
            <img src={actorTokenImage($actor)} class="portrait" />
            <span>{$actor.token ? $actor.token.name : $actor.name}</span>
        {:else}
            <span> UNKNOWN TARGET </span>
        {/if}
    </div>

    {#each records as rec, i (i)}
        <div>
            <HarmRecord
                record={rec}
                obscure={!can_see}
                on:changetype={(evt) => setType(i, evt.detail)}
                on:delete={() => deleteHarm(i)}
                on:toggleflag={(evt) => toggleFlag(i, evt.detail)}
            />
        </div>
    {/each}

    {#if can_apply}
        <button on:click={apply}>Apply</button>
    {/if}
</div>

<style lang="scss">
    .portrait {
        max-width: 32px;
        max-height: 32px;
        margin-right: 10px;
    }
    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>
