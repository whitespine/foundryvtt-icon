<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    import { setContext } from "svelte";
    import * as harm from "../../util/harm";
    import HarmManifestEntry from "../components/combat/HarmManifestEntry.svelte";

    /** @type {ChatMessage} */
    // svelte-ignore unused-export-let
    export let msg;

    setContext("message", msg);

    /**
     * The displayed harm manifest
     * @type {harm.HarmManifest}
     */
    export let harm_manifest;
</script>

<div class="icon flexcol">
    <h1>Damage</h1>
    {#each Object.entries(harm_manifest) as [actor_uuid, records]}
        <HarmManifestEntry actor_uuid={actor_uuid} records={records} />
    {/each}
</div>
