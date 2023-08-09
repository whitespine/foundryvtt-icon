<script>
    import { getContext } from "svelte";
    import IndividualStatusDisplay from "./IndividualStatusDisplay.svelte";

    let actor = getContext("tjs_actor");

    const name_alphabetical = (a, b) => a.name.localeCompare(b.name);
    const statuses = actor.embedded.create(ActiveEffect, {
        name: "effects",
        filters: [],
        sort: name_alphabetical,
    });
</script>

<div class="statuses">
    <h3>Statuses</h3>
    {#each [...$statuses] as status}
        <IndividualStatusDisplay status={status} />    
    {/each}
</div>

<style lang="scss">
    .statuses {
        display: flex;
        flex-direction: column;
    }
</style>
