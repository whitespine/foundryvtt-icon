<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import { localize } from "../../util/misc";
    import DocClock from "../components/generic/DocClock.svelte";
    import BoundedNumberDisplay from "../components/generic/BoundedNumberDisplay.svelte";
    import Tabs from "../components/generic/Tabs.svelte";
    import ActionRating from "../components/ActionRating.svelte";
    import Portrait from "../components/Portrait.svelte";
    import PreviewBondPower from "../components/preview/PreviewBondPower.svelte";
    import { dropDocs } from "../actions/drop";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias

    // Initialize our embedded categories
    const name_alphabetical = (a, b) => a.name.localeCompare(b.name);
    const bond_powers = actor.embedded.create(Item, {
        name: "bond_powers",
        filters: [(i) => i.type === "bond_power"],
        sort: name_alphabetical,
    });
    const traits = actor.embedded.create(Item, {
        name: "traits",
        filters: [(i) => i.type === "trait"],
        sort: name_alphabetical,
    });

    // Set our tabs
    const tabs = ["ICON.Narrative", "ICON.Traits-Relics", "ICON.AbilitiesTrophies", "ICON.Attributes"].map((s) => ({
        label: localize(s),
        key: s,
    }));
    let selected_tab = "ICON.Narrative";

    // Handle dropped documents
    function handleDrop(drop) {
        $actor.createEmbeddedDocuments("Item", [foundry.utils.duplicate(drop.document.toObject(true))]);
    }

    function allowDrop(drop) {
        return drop.type == "Item" && ["bond_power", "trait", "job"].includes(drop.document.type);
    }
</script>

<main use:dropDocs={{ handle: handleDrop, allow: allowDrop }}>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <input style="grid-area: char_name" type="text" use:updateDoc={{ doc, path: "name" }} />
        <input
            style="grid-area: player_name"
            type="text"
            use:updateDoc={{ doc, path: "system.player_name" }}
            placeholder="Player Name"
        />
        <div style="grid-area: narr" class="header-information">
            <span>{localize("ICON.Kintype")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.kin" }} />
            <span>{localize("ICON.Culture")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.culture" }} />
            <span>{localize("ICON.Bond")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.bond" }} />
        </div>
        <div style="grid-area: comb" class="header-information">
            <span>{localize("ICON.Class")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.class" }} />
            <span>{localize("ICON.Job")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.job" }} />
            <span>{localize("ICON.Level")}: </span>
            <input type="number" use:updateDoc={{ doc, path: "system.level" }} />
        </div>
        <div style="grid-area: stats" class="flexrow">
            <BoundedNumberDisplay name={localize("ICON.Effort")} path="system.effort" />
            <BoundedNumberDisplay name={localize("ICON.Health")} path="system.hp" />
        </div>
    </header>

    <!-- Sheet Tab Navigation -->
    <Tabs {tabs} bind:selected={selected_tab} />

    <!-- Sheet Body -->
    <section class="sheet-body">
        {#if selected_tab == "ICON.Narrative"}
            <!-- Narrative Tab -->
            <div class="narrative-grid">
                <div class="leftcol">
                    <div class="actions">
                        {#each Object.keys($actor.system.actions) as action_name}
                            <ActionRating path={`system.actions.${action_name}`} />
                        {/each}
                    </div>
                </div>
                <div class="midcol">
                    {#each [...$bond_powers] as bp (bp.id)}
                        <PreviewBondPower power={bp} />
                    {/each}
                </div>
                <div class="rightcol">
                    <div class="xp">
                        <BoundedNumberDisplay name={localize("ICON.XP")} path="system.xp" />
                    </div>
                    <div class="dust">
                        <BoundedNumberDisplay name={localize("ICON.Dust")} path="system.dust" />
                    </div>
                    <div class="burdens">
                        {#each Object.entries($actor.system.burdens) as [key, _clock]}
                            <DocClock clock_width="60px" path={`system.burdens.${key}`} inline />
                        {/each}
                    </div>
                    <div class="ambitions">
                        {#each Object.entries($actor.system.ambitions) as [key, _clock]}
                            <DocClock clock_width="60px" path={`system.ambitions.${key}`} inline />
                        {/each}
                    </div>
                </div>
            </div>
        {:else if selected_tab === "ICON.Traits-Relics"}
            <!-- Traits & Relics Tab -->
            <div>
                <div class="traitsrelics">
                    <div class="traitheader">
                        <span>Traits</span>
                    </div>

                    <!-- Abilities & Trophies Tab -->
                    <div class="tab items" actor-group="primary" actor-tab="items">
                        <div class="CombatBar">
                            <div class="Personal Resolve">
                                <span>Personal Resolve</span>
                                <span>Wounds</span>
                                <span>Abilities</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <span>Tab does not exist</span>
        {/if}
    </section>
</main>

<style lang="scss">
    main {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    header {
        flex: 0 1 auto;
        display: grid;
        grid-template:
            "pic    char_name   player_name" 30px
            "pic    narr        comb" 80px
            "pic    stats       stats" 1fr / 120px 1fr 1fr;
        gap: 10px;
        padding: 10px;

        .header-information {
            display: grid;
            grid-template: 1fr 1fr 1fr / 1fr 1fr;
        }
    }

    .sheet-body {
        .narrative-grid {
            display: grid;
            grid-template: 1fr / 180px 1fr 180px;

            > div {
                border-right: var(--primary-border);
                border-bottom: var(--primary-border);
            }
        }

        .actions {
            grid-area: actions;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: var(--primary-border);
        }

        .xp {
            grid-area: xp;
        }
        .dust {
            grid-area: dust;
        }
        .burdens {
            grid-area: burdens;
            border-bottom: var(--primary-border);
            border-top: var(--primary-border);
        }
        .ambitions {
            grid-area: ambitions;
        }
    }
</style>
