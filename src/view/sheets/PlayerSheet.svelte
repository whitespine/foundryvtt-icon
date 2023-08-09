<script>
    import { tooltip } from "@svelte-plugins/tooltips";
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
    import CombatHud from "../components/combat/CombatHud.svelte";
    import StatsDisplay from "../components/combat/StatsDisplay.svelte";
    import { dragAsDoc } from "../actions/drag";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias

    // Initialize our embedded categories
    const name_alphabetical = (a, b) => a.name.localeCompare(b.name);
    const bond_powers = actor.embedded.create(Item, {
        name: "bond_powers",
        filters: [(i) => i.type === "bond_power"],
        sort: name_alphabetical,
    });
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
    const tabs = ["ICON.Narrative", "ICON.Combat"].map((s) => ({
        label: localize(s),
        key: s,
    }));
    let selected_tab = "ICON.Narrative";

    /**
     * Add dropped items to this actor
     * @param {import("../../util/dragdrop").ResolvedDrop} drop
     */
    function handleDrop(drop) {
        // Destroy old job or bond
        if (drop.type === "Item") {
            if (drop.document.type === "bond") $actor.system.bond?.delete();
            if (drop.document.type === "job") $actor.system.job?.delete();
        }
        // Create the item
        $actor.createEmbeddedDocuments("Item", [foundry.utils.duplicate(drop.document.toObject(true))]);
    }

    /**
     * Test whether to allow the specified drop
     * @param {import("../../util/dragdrop").ResolvedDrop} drop Resolved drop data
     */
    function allowDrop(drop) {
        return drop.type == "Item" && ["bond_power", "bond", "job", "ability"].includes(drop.document.type);
    }

    /**
     * Open the current bond for editing
     */
    function editBond() {
        $actor.system.bond.sheet.render(true, { focus: true });
    }

    /**
     * Open the current job for editing
     */
    function editJob() {
        $actor.system.job.sheet.render(true, { focus: true });
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
            <span><strong>{localize("ICON.Kintype")}:</strong></span>
            <input type="text" use:updateDoc={{ doc, path: "system.kin" }} />
            <span><strong>{localize("ICON.Culture")}:</strong> </span>
            <input type="text" use:updateDoc={{ doc, path: "system.culture" }} />
            <span><strong>{localize("ICON.Bond.Bond")}:</strong></span>
            <span>{$actor.system.bond?.name ?? "None"}</span>
        </div>
        <div style="grid-area: comb" class="header-information">
            <span><strong>{localize("ICON.Class")}:</strong></span>
            <span>{$actor.system.class?.player_class_name ?? "None"}</span>
            <span><strong>{localize("ICON.Job")}:</strong></span>
            <span draggable="true" use:dragAsDoc={{ doc: $actor.system.job }}>
                {#if $actor.system.job}
                    {$actor.system.job?.name}
                    <i class="fas fa-edit" style="float: right; cursor: pointer" on:click={editJob} />
                {:else}
                    None
                {/if}
            </span>
            <span>{localize("ICON.Level")}:</span>
            <input type="number" use:updateDoc={{ doc, path: "system.level" }} />
        </div>

        <div style="grid-area: tabs">
            <!-- Sheet Tab Navigation -->
            <Tabs {tabs} horizontal={false} bind:selected={selected_tab} />
        </div>
    </header>

    <!-- Sheet Body -->
    {#if selected_tab == "ICON.Narrative"}
        <section class="sheet-body narrative">
            <!-- Narrative Tab -->
            <div class="narrative-grid">
                <div class="leftcol">
                    <div class="actions">
                        {#each Object.keys($actor.system.actions) as action_name}
                            <ActionRating path={`system.actions.${action_name}`} />
                        {/each}
                    </div>
                    <div class="bond">
                        {#if $actor.system.bond}
                            <h2
                                style="text-align: center;"
                                use:tooltip={{ content: $actor.system.bond.system.description }}
                                use:dragAsDoc={{ doc: $actor.system.bond }}
                                draggable="true"
                            >
                                {$actor.system.bond.name}
                                <i class="fas fa-edit fa-xs" on:click={editBond} />
                            </h2>
                            <div class="flexrow">
                                <BoundedNumberDisplay name={localize("ICON.Strain")} path="system.strain" />
                                <BoundedNumberDisplay name={localize("ICON.Effort")} path="system.effort" />
                            </div>
                            <span>
                                <strong>{localize("ICON.Bond.SecondWind")}</strong>
                                {$actor.system.bond.system.second_wind}
                            </span>
                            <span>
                                <strong>{localize("ICON.Bond.SpecialAbility")}:</strong>
                                {$actor.system.bond.system.special_ability}
                            </span>
                            <span><strong>{localize("ICON.Bond.Ideals")}:</strong></span>
                            <ul>
                                {#each $actor.system.bond.system.ideals as ideal}
                                    <li>{ideal}</li>
                                {/each}
                            </ul>
                        {:else}
                            <h2>No Bonds???</h2>
                            <p>Drag a bond from the compendium or item tab!</p>
                        {/if}
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
        </section>
    {:else if selected_tab === "ICON.Combat"}
        <section class="sheet-body combat">
            <StatsDisplay style="grid-area: stats" />
            <CombatHud abilities={[...$abilities]} traits={[...$traits]} />
        </section>
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
            "pic    char_name   player_name tabs" 20px
            "pic    narr        comb        tabs" 80px / 110px 1fr 1fr 1fr;
        gap: 5px;
        padding: 10px;

        .header-information {
            display: grid;
            grid-template: 1fr 1fr 1fr / 1fr 1fr;
            align-items: center;
        }
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
    }

    .sheet-body.narrative {
        max-height: calc(100% - 100px);
    }

    .sheet-body.combat {
        max-height: calc(100% - 160px);
    }

    .narrative {
        .narrative-grid {
            display: grid;
            grid-template: 1fr / 220px 1fr 220px;
            height: 100%;
        }

        .leftcol,
        .midcol {
            border-right: var(--primary-border);
            padding-right: 10px;
        }
        .midcol,
        .rightcol {
            padding-left: 10px;
        }

        .actions {
            grid-area: actions;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: var(--primary-border);
            padding-bottom: 10px;
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

        .bond {
            h2 {
                text-align: center;
            }
            display: flex;
            flex-direction: column;
            padding-top: 10px;
        }
    }
</style>
