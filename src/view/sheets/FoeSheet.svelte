<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import { localize } from "../../util/misc";
    import BoundedNumberDisplay from "../components/generic/BoundedNumberDisplay.svelte";
    import Tabs from "../components/generic/Tabs.svelte";
    import Portrait from "../components/Portrait.svelte";
    import { dropDocs } from "../actions/drop";
    import CombatHud from "../components/combat/CombatHud.svelte";
    import { FOE_COLORS, GENERIC_COLORS } from "../../models/items/job";
    import StatsDisplay from "../components/combat/StatsDisplay.svelte";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias

    // Initialize our embedded categories
    const name_alphabetical = (a, b) => a.name.localeCompare(b.name);
    const abilities = actor.embedded.create(Item, {
        name: "abilities",
        filters: [(i) => i.type === "ability"],
        sort: name_alphabetical,
    });
    const traits = actor.embedded.create(Item, {
        name: "traits",
        filters: [(i) => i.type === "trait"],
        sort: name_alphabetical,
    });

    // Set our tabs
    const tabs = ["ICON.Foe.Abilities", "ICON.Foe.Description", "ICON.Foe.Stats"].map((s) => ({
        label: localize(s),
        key: s,
    }));
    let selected_tab = "ICON.Foe.Abilities";

    // Handle dropped documents
    function handleDrop(drop) {
        $actor.createEmbeddedDocuments("Item", [foundry.utils.duplicate(drop.document.toObject(true))]);
    }

    function allowDrop(drop) {
        return drop.type == "Item" && ["ability", "trait"].includes(drop.document.type);
    }
</script>

<main use:dropDocs={{ handle: handleDrop, allow: allowDrop }}>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <input style="grid-area: foe_name" type="text" use:updateDoc={{ doc, path: "name" }} />
        <select style="grid-area: foe_template" use:updateDoc={{ doc, path: "system.template" }}>
            {#each ["Normal", "Elite", "Mob", "Legend"] as t}
                <option value={t}>{t}</option>
            {/each}
        </select>
        <input style="grid-area: foe_faction" type="text" use:updateDoc={{ doc, path: "system.faction" }} />
        <select style="grid-area: foe_class" use:updateDoc={{ doc, path: "system.class.color" }}>
            {#each FOE_COLORS as c, i}
                <option value={GENERIC_COLORS[i]}>{c}</option>
            {/each}
        </select>
        <StatsDisplay style="grid-area: stats" actor={$actor} />
        <div style="grid-area: tabs">
            <Tabs horizontal={false} {tabs} bind:selected={selected_tab} />
        </div>
    </header>

    <!-- Sheet Tab Navigation -->

    <!-- Sheet Body -->
    <section class="sheet-body">
        {#if selected_tab == "ICON.Foe.Abilities"}
            <CombatHud abilities={[...$abilities]} traits={[...$traits]} />
        {:else if selected_tab === "ICON.Foe.Description"}
            <div class="flexcol">
                <h2>{localize("ICON.Description")}</h2>
                <!-- TODO: Prosemirror -->
                <textarea use:updateDoc={{ doc, path: "system.description" }} rows="10" />
                <h2>{localize("ICON.Foe.Setup")}</h2>
                <!-- TODO: Prosemirror -->
                <textarea use:updateDoc={{ doc, path: "system.setup" }} rows="10" />
            </div>
        {:else if selected_tab === "ICON.Foe.Stats"}
            <div class="flexcol">
                {#each ["defense", "damage_die", "fray_damage", "speed", "dash"] as stat}
                    <label for={stat}>{stat}:</label>
                    <input name={stat} type="number" use:updateDoc={{ doc, path: `system.class.${stat}` }} />
                {/each}
            </div>
        {:else}
            <span>Tab does not exist</span>
        {/if}
    </section>
</main>

<style lang="scss">
    main {
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }

    header {
        flex: 0 1 auto;
        display: grid;
        grid-template:
            "pic    foe_name    foe_template    tabs" 30px
            "pic    foe_faction foe_class       tabs" 30px
            "pic    stats       stats           tabs" 30px / 120px 1fr 1fr 120px;
        gap: 5px;
        padding: 10px;
        align-items: center;
        text-align: center;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 120px);
    }
</style>
