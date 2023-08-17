<script>
    import * as harm from "../../../util/harm";
    import HarmRecord from "./HarmRecord.svelte";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

    /** @type {string} */
    export let actor_uuid;

    let actor = new TJSDocument(fromUuidSync(actor_uuid) ?? undefined);

    /** @type {harm.HarmRecord[]} */
    export let records;

    /** @type {harm.HarmRecord} */
    let last_record;
    $: last_record = records[records.length - 1];

    /** @type {boolean} */
    let can_apply;
    $: can_apply = last_record && (
        last_record.final_hp != $actor?.system.hp.value || last_record.final_vigor != $actor?.system.vigor.value);

    /** @type {boolean} */
    let can_see;
    $: can_see = $actor?.testUserPermission(game.user, "OBSERVER");

    // Sets the actors hp/vigor to match the end of the record
    function apply() {
        $actor.update({
            "system.hp.value": last_record.final_hp,
            "system.vigor.value": last_record.final_vigor,
        });
    }
</script>

<div class="flexcol">
    <div class="header">
        {#if $actor}
            <img src={$actor.img} class="portrait" />
            <span>{$actor.name}</span>
        {:else}
            <span> UNKNOWN TARGET </span>
        {/if}
    </div>

    {#each records as rec, i (i)}
        <div>
            <HarmRecord record={rec} obscure={!can_see} />
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
