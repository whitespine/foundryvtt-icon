<script>
    import * as harm from "../../../util/harm";
    import HarmRecord from "./HarmRecord.svelte";

    /** @type {string} */
    export let actor_uuid;

    let actor = fromUuidSync(actor_uuid);

    /** @type {harm.HarmRecord[]} */
    export let records;
</script>

<div class="flexcol">
    <div class="flexrow">
        {#if actor}
            <img src={actor.img} class="portrait" />
            <span>{actor.name}</span>
        {:else}
            <span> UNKNOWN TARGET </span>
        {/if}
    </div>

    {#each records as rec}
        <HarmRecord record={rec} />
    {/each}
</div>

<style lang="scss">
    .portrait {
        width: 32px;
        height: 32px;
    }
</style>
