<script>
    import { getContext } from "svelte";
    import IndividualStatusDisplay from "./IndividualStatusDisplay.svelte";

    import { slide } from "svelte/transition";
    import { ICON } from "../../../consts";
    import { saveAgainst } from "../../../config/statuses";

    let actor = getContext("tjs_actor");

    const name_alphabetical = (a, b) => a.name.localeCompare(b.name);
    const statuses = actor.embedded.create(ActiveEffect, {
        name: "effects",
        filters: [],
        sort: name_alphabetical,
    });

    function saveAll() {
        let saveable = Array.from($statuses);
        saveable = saveable.filter(s => s.getFlag(game.system.id, ICON.flags.status_saveable));
        saveable = saveable.filter(s => !s.getFlag(game.system.id, ICON.flags.status_ongoing));
        if(!saveable.length) {
            ui.notifications.info("Nothing to save against!");
        } else {
            saveAgainst(...saveable);
        }
    }
</script>

<div class="statuses">
    <h3>
        Statuses 
        <i class="fas fa-dice clickable" data-tooltip="Save against all negative effects" on:click={saveAll}/>
    </h3>
    {#each [...$statuses] as status (status.id)}
        <div transition:slide={{ axis: "y", duration: 200 }}>
            <IndividualStatusDisplay status={status} />    
        </div>
    {/each}
</div>

<style lang="scss">
    .statuses {
        display: flex;
        flex-direction: column;
    }
</style>
