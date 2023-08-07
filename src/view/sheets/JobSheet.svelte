<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import Portrait from "../components/Portrait.svelte";
    import Tabs from "../components/generic/Tabs.svelte";
    import { GENERIC_COLORS, PLAYER_COLORS } from "../../models/items/job";
    import { localize } from "../../util/misc";

    let actor = getContext("tjs_actor");
    let item = getContext("tjs_item"); // Alias
    let doc = item;

    // Set our tabs
    const tabs = ["ICON.JobSheet.Details", "ICON.JobSheet.Abilities", "ICON.JobSheet.Attributes"].map((s) => ({
        label: localize(s),
        key: s,
    }));
    let selected_tab = "ICON.JobSheet.Details";
</script>

<main>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <div style="grid-area: job_name">
            <label for="name">Name:</label>
            <input name="name" type="text" use:updateDoc={{ doc, path: "name" }} />
        </div>
        <div style="grid-area: tabs">
            <Tabs horizontal={false} {tabs} bind:selected={selected_tab} />
        </div>
    </header>

    <!-- Sheet Body -->
    <section class="sheet-body">
        {#if selected_tab === "ICON.JobSheet.Details"}
            <div class="flexcol">
                <label for="description">Description:</label>
                <textarea name="description" use:updateDoc={{ doc, path: "system.description" }} rows="5" />
            </div>
        {:else if selected_tab === "ICON.JobSheet.Abilities"}
            <span> TODO: Abilities previews </span>
        {:else if selected_tab === "ICON.JobSheet.Attributes"}
            <div class="flexcol">
                <label for="color">Color</label>
                <select name="color" use:updateDoc={{ doc, path: "system.class.color" }}>
                    {#each PLAYER_COLORS as c, i}
                        <option value={GENERIC_COLORS[i]}>{c}</option>
                    {/each}
                </select>
                {#each ["defense", "damage_die", "fray_damage", "speed", "dash", "vitality"] as stat}
                    <label for={stat}>{stat}:</label>
                    <input name={stat} type="number" use:updateDoc={{ doc, path: `system.class.${stat}` }} />
                {/each}
            </div>
        {:else}
            <span>Error</span>
        {/if}
    </section>
</main>

<style lang="scss">
    main {
        background-color: #99d9ea;
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }

    header {
        display: grid;
        grid-template: "pic job_name tabs" 120px / 120px 1fr 1fr;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 140px);
    }
</style>
