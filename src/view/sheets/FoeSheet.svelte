<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import { localize } from "../../util/misc";
    import BoundedNumberDisplay from "../components/generic/BoundedNumberDisplay.svelte";
    import Tabs from "../components/generic/Tabs.svelte";
    import Portrait from "../components/Portrait.svelte";
    import { dropDocs } from "../actions/drop";
    import CombatHud from "../components/CombatHud.svelte";

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

<main class="flexcol" autocomplete="off" use:dropDocs={{ handle: handleDrop, allow: allowDrop }}>
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
        <select style="grid-area: foe_class" use:updateDoc={{ doc, path: "system.class" }}>
            {#each ["Special", "Red", "Yellow", "Blue", "Green"] as c}
                <option value={c}>{c}</option>
            {/each}
        </select>
        <div style="grid-area: stats" class="flexrow">
            <BoundedNumberDisplay name={localize("ICON.Health")} path="system.hp" />
            <BoundedNumberDisplay name={localize("ICON.Vigor")} path="system.vigor" />
            <span>Def: {$actor.system.defense}</span>
            <span>Die: D{$actor.system.damage_die}</span>
            <span>Fray: {$actor.system.fray_damage}</span>
            <span>Speed: {$actor.system.speed}</span>
            <span>Dash: {$actor.system.dash}</span>
        </div>
    </header>

    <!-- Sheet Tab Navigation -->
    <Tabs {tabs} bind:selected={selected_tab} />

    <!-- Sheet Body -->
    <section class="sheet-body">
        {#if selected_tab == "ICON.Foe.Abilities"}
            <CombatHud {abilities} {traits} />
        {:else if selected_tab === "ICON.Foe.Description"}
            <div class="flexcol">
                <h2>{localize("ICON.Description")}</h2>
                <!-- TODO: Prosemirror -->
                <textarea use:updateDoc={{ doc, path: "description" }} rows="10" />
                <h2>{localize("ICON.Foe.Setup")}</h2>
                <!-- TODO: Prosemirror -->
                <textarea use:updateDoc={{ doc, path: "setup" }} rows="10" />
            </div>
        {:else if selected_tab === "ICON.Foe.Stats"}
            <div class="flexcol">
                {#each ["defense", "damage_die", "fray_damage", "speed", "dash"] as stat}
                    <label for={stat}>{stat}:</label>
                    <input
                        name={stat}
                        style="grid-area: foe_class"
                        type="text"
                        use:updateDoc={{ doc, path: `system.${stat}` }}
                    />
                {/each}
            </div>
        {:else}
            <span>Tab does not exist</span>
        {/if}
    </section>
</main>

<style lang="scss">
    $border: solid black 1px;

    main {
        background-color: rgb(110, 166, 152);
    }

    header {
        display: grid;
        grid-template:
            "pic    foe_name    foe_template" 30px
            "pic    foe_faction foe_class" 30px
            "pic    stats      stats" 30px / 120px 1fr 1fr;
        gap: 10px;
        padding: 10px;
        align-items: center;
        text-align: center;
    }

    .sheet-body {
    }
</style>