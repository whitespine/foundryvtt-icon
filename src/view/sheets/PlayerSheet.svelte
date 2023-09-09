<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import { localize } from "../../util/misc";
    import Tabs from "../components/generic/Tabs.svelte";
    import Portrait from "../components/Portrait.svelte";
    import { dropDocs } from "../actions/drop";
    import CombatHud from "../components/combat/CombatHud.svelte";
    import StatsDisplay from "../components/combat/StatsDisplay.svelte";
    import { dragAsDoc } from "../actions/drag";
    import Progression from "./player/Progression.svelte";
    import Narrative from "./player/Narrative.svelte";
    import { TAB_STORES } from "../../util/stores/tabs";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias
    // Set our tabs
    const tabs = ["ICON.Narrative", "ICON.Combat", "ICON.Progression"].map((s) => ({
        label: localize(s),
        key: s,
    }));
    let selected_tab = TAB_STORES.get($actor.uuid, "ICON.Narrative");

    /**
     * Add dropped items to this actor
     * @param {Item} doc The dropped document
     */
    async function handleDrop(doc) {
        // Destroy old job or bond
        if (doc instanceof Item) {
            if (doc.type === "bond") await $actor.system.bond?.delete();
            if (doc.type === "job") await $actor.system.job?.delete();
            $actor.createEmbeddedDocuments("Item", [foundry.utils.duplicate(doc.toObject(true))]);
        }
    }

    /**
     * Test whether to allow the specified drop
     * @param {Item} doc The dropped document
     */
    function allowDrop(doc) {
        console.log(doc);
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
                    <i class="fas fa-edit" style="float: right; cursor: pointer" on:click={() => $actor.system.bond.sheet.render(true, { focus: true })} />
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
                    <i class="fas fa-edit" style="float: right; cursor: pointer" on:click={() => $actor.system.job.sheet.render(true, { focus: true })} />
                {:else}
                    None
                {/if}
            </span>
            <span>{localize("ICON.Level")}:</span>
            <input type="number" use:updateDoc={{ doc, path: "system.level" }} />
        </div>

        <div style="grid-area: tabs">
            <!-- Sheet Tab Navigation -->
            <Tabs {tabs} horizontal={false} bind:selected={$selected_tab} />
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
    }

    .sheet-body {
        padding: 5px 5px 0px 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 162px);
    }
</style>
