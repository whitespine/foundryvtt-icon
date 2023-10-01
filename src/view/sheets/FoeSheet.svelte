<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import { handleSortEmbeddedItem, localize } from "../../util/misc";
    import Tabs from "../components/generic/Tabs.svelte";
    import Portrait from "../components/Portrait.svelte";
    import { dropDocs } from "../actions/drop";
    import CombatHud from "../components/combat/CombatHud.svelte";
    import { FOE_COLORS, GENERIC_COLORS } from "../../models/items/job";
    import StatsDisplay from "../components/combat/StatsDisplay.svelte";
    import ProseMirrorEditor from "../components/generic/ProseMirrorEditor.svelte";
    import { TAB_STORES } from "../../util/stores/tabs";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias

    // Set our tabs
    const tabs = ["ICON.Foe.Abilities", "ICON.Foe.Description", "ICON.Foe.Stats"].map((s) => ({
        label: localize(s),
        key: s,
    }));
    let selected_tab = TAB_STORES.get($actor.uuid, "ICON.Foe.Abilities");

    /**
     *
     * @param {Item} doc The dropped document
     */
    async function handleDrop(doc, event) {
        if (doc.actor === $actor) {
            // Attempt resorting
            await handleSortEmbeddedItem(doc, event);
        } else if (["ability"].includes(doc.type)) {
            await $actor.createEmbeddedDocuments("Item", [foundry.utils.duplicate(doc.toObject(true))]);
        }
    }

    /**
     *
     * @param {Item} doc The dropped document
     */
    function allowDrop(doc) {
        return ["ability"].includes(doc.type);
    }
</script>

<main use:dropDocs={{ handle: handleDrop, allow: allowDrop }}>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <div style="grid-area: name" class="iflexrow">
            <label for="name">Name:</label>
            <input type="text" name="name" use:updateDoc={{ doc, path: "name" }} />
        </div>
        <select style="grid-area: template" use:updateDoc={{ doc, path: "system.template" }}>
            {#each ["Normal", "Elite", "Mob", "Legend"] as t}
                <option value={t}>{t}</option>
            {/each}
        </select>
        <div style="grid-area: faction" class="iflexrow">
            <label for="faction">Faction:</label>
            <input name="faction" type="text" use:updateDoc={{ doc, path: "system.faction" }} />
        </div>
        <select style="grid-area: class" use:updateDoc={{ doc, path: "system.class.color" }}>
            {#each FOE_COLORS as c, i}
                <option value={GENERIC_COLORS[i]}>{c}</option>
            {/each}
        </select>
        <StatsDisplay style="grid-area: stats" />
        <div style="grid-area: tabs">
            <Tabs horizontal={false} {tabs} bind:selected={$selected_tab} />
        </div>
    </header>

    <!-- Sheet Tab Navigation -->

    <!-- Sheet Body -->
    <section class="sheet-body">
        {#if $selected_tab == "ICON.Foe.Abilities"}
            <CombatHud />
        {:else if $selected_tab === "ICON.Foe.Description"}
            <div class="flexcol">
                <h2>{localize("ICON.Description")}</h2>
                <ProseMirrorEditor doc={$doc} path={"system.description"} />
                <h2>{localize("ICON.Foe.Setup")}</h2>
                <ProseMirrorEditor doc={$doc} path={"system.setup"} />
            </div>
        {:else if $selected_tab === "ICON.Foe.Stats"}
            <div class="flexcol">
                {#each [["Defense", "class.defense"], ["Damage Dice", "class.damage_die"], ["Fray Damage", "class.fray_damage"], ["Speed", "class.speed"], ["Dash", "class.dash"], ["Vitality", "class.vitality"], ["Armor", "class.armor"], ["Max HP (0 for 4*VIT)", "hp_max_override"]] as [label, stat]}
                    <label for={label}>{label}:</label>
                    <input name={label} type="number" use:updateDoc={{ doc, path: `system.${stat}` }} />
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
            "pic    name    template    tabs" 30px
            "pic    faction class       tabs" 30px
            "pic    stats       stats           tabs" 30px / 120px 1fr 1fr 120px;
        gap: 5px;
        padding: 10px;
        align-items: center;
        label {
            width: 80px;
        }
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 120px);
    }
</style>
