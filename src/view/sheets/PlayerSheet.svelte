<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import { handleSortEmbeddedItem, localize } from "../../util/misc";
    import Portrait from "../components/Portrait.svelte";
    import { dropDocs } from "../actions/drop";
    import CombatHud from "../components/combat/CombatHud.svelte";
    import StatsDisplay from "../components/combat/StatsDisplay.svelte";
    import { dragAsDoc } from "../actions/drag";
    import Progression from "./player/Progression.svelte";
    import Narrative from "./player/Narrative.svelte";
    import { TAB_STORES } from "../../util/stores/tabs";
    import Notes from "./player/Notes.svelte";
    import Loadout from "./player/Loadout.svelte";
    import { equipBond, equipJob } from "../../util/loadout";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias
    // Set our tabs
    const tabs = ["ICON.Narrative", "ICON.Notes", "ICON.Combat", "ICON.Loadout", "ICON.Progression"].map((s) => ({
        label: localize(s),
        key: s,
    }));
    let selected_tab = TAB_STORES.get($actor.uuid, "ICON.Narrative");

    /**
     * Add dropped items to this actor
     * @param {Item} doc The dropped document
     * @param {DropEvent} event The drop event
     */
    async function handleDrop(doc, event) {
        // Destroy old job or bond
        if (doc instanceof Item) {
            if (doc.actor === $actor) {
                // Attempt resorting
                await handleSortEmbeddedItem(doc, event);
            } else {
                let [owned_doc] = await $actor.createEmbeddedDocuments("Item", [
                    foundry.utils.duplicate(doc.toObject(true)),
                ]);
                if (owned_doc.type === "bond") await equipBond($actor, owned_doc);
                if (owned_doc.type === "job") await equipJob($actor, owned_doc);
            }
        }
    }

    /**
     * Test whether to allow the specified drop
     * @param {Item} doc The dropped document
     */
    function allowDrop(doc) {
        return ["bond-power", "bond", "job", "ability", "relic"].includes(doc.type);
    }
</script>

<main use:dropDocs={{ handle: handleDrop, allow: allowDrop }}>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <input style="grid-area: name" type="text" use:updateDoc={{ doc, path: "name" }} />
        <input
            style="grid-area: player_name"
            type="text"
            use:updateDoc={{ doc, path: "system.player_name" }}
            placeholder="Player Name"
        />
        <div style="grid-area: narr" class="header-information">
            <span><strong>{localize("ICON.Kintype")}:</strong></span>
            <input type="text" use:updateDoc={{ doc, path: "system.kin" }} />
            <span><strong>{localize("ICON.Culture")}:</strong> </span>
            <input type="text" use:updateDoc={{ doc, path: "system.culture" }} />
            <span data-tooltip={$actor.system.bond ? null : localize("ICON.Tutorial.AddBond")}>
                <strong>{localize("ICON.Bonds.Bond")}:</strong>
            </span>
            <span>
                {#if $actor.system.bond}
                    {$actor.system.bond.name}
                    <i
                        class="fas fa-edit"
                        style="float: right; cursor: pointer"
                        on:click={() => $actor.system.bond.sheet.render(true, { focus: true })}
                    />
                {:else}
                    None
                {/if}
            </span>
        </div>
        <div style="grid-area: comb" class="header-information">
            <span><strong>{localize("ICON.Class")}:</strong></span>
            <span>{$actor.system.class?.player_class_name ?? "None"}</span>
            <span data-tooltip={$actor.system.job ? null : localize("ICON.Tutorial.AddJob")}>
                <strong>{localize("ICON.Job")}:</strong>
            </span>
            <span draggable="true" use:dragAsDoc={{ doc: $actor.system.job }}>
                {#if $actor.system.job}
                    {$actor.system.job.name}
                    <i
                        class="fas fa-edit"
                        style="float: right; cursor: pointer"
                        on:click={() => $actor.system.job.sheet.render(true, { focus: true })}
                    />
                {:else}
                    None
                {/if}
            </span>
            <span>{localize("ICON.Level")}:</span>
            <input type="number" use:updateDoc={{ doc, path: "system.level" }} />
        </div>

        <div class="tabs" style="grid-area: tabs">
            <!-- Sheet Tab Navigation -->
            <!--<Tabs {tabs} horizontal={false} bind:selected={$selected_tab} />-->
            {#each tabs as tab}
                <button class="tab" class:active={tab.key === $selected_tab} on:click={() => ($selected_tab = tab.key)}
                    >{tab.label}</button
                >
            {/each}
        </div>
    </header>

    <!-- Sheet Body -->
    {#if $selected_tab == "ICON.Narrative"}
        <Narrative />
    {:else if $selected_tab === "ICON.Combat"}
        <section class="sheet-body combat">
            {#if $actor.system.job}
                <StatsDisplay style="grid-area: stats" />
                <CombatHud loadout_button={true} />
            {:else}
                <span>
                    {localize("ICON.Tutorial.AddJob")}
                </span>
            {/if}
        </section>
    {:else if $selected_tab == "ICON.Progression"}
        <Progression />
    {:else if $selected_tab == "ICON.Notes"}
        <Notes />
    {:else if $selected_tab == "ICON.Loadout"}
        <Loadout />
    {:else}
        <span>Tab does not exist</span>
    {/if}
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
            "pic    name   player_name tabs" 20px
            "pic    narr   comb        tabs" 80px / 110px 1fr 1fr 1fr;
        gap: 5px;
        padding: 10px;

        .header-information {
            display: grid;
            grid-template: 1fr 1fr 1fr / 1fr 1fr;
            align-items: center;
        }

        .tabs {
            display: grid;
            height: 100%;
            grid-template: repeat(3, 1fr) / repeat(2, 1fr);

            button {
                line-height: 1em;
            }
        }
    }

    .sheet-body {
        padding: 5px 5px 0px 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 162px);
    }
</style>
