<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import Portrait from "../components/Portrait.svelte";
    import EditableDocArray from "../components/generic/EditableDocArray.svelte";
    import ProseMirrorEditor from "../components/generic/ProseMirrorEditor.svelte";
    import Tabs from "../components/generic/Tabs.svelte";
    import { localize } from "../../util/misc";
    import { TAB_STORES } from "../../util/stores";
    import PreviewItem from "../components/preview/PreviewItem.svelte";
    import { dropDocs } from "../actions/drop";
    import { simpleMixUUIDList } from "../actions/util";

    let actor = getContext("tjs_actor");
    let item = getContext("tjs_item"); // Alias
    let doc = item;

    const tabs = ["ICON.BondSheet.Details", "ICON.BondSheet.Abilities", "ICON.BondSheet.Gear"].map((s) => ({
        label: localize(s),
        key: s,
    }));
    let selected_tab = TAB_STORES.get($actor.uuid, "ICON.BondSheet.Details");

    function allowDropPower(drop) {
        // A very simple requirement
        return drop.document.type === "bond-power";
    }

    function handleDropPower(drop, event) {
        // Just add it to the end of the list
        let effective_target = event.target.closest("[data-uuid]")?.dataset.uuid;

        // It's not a limit break, and is a trait
        $item.update({
            "system.powers": simpleMixUUIDList($item.system.powers, drop.document.uuid, effective_target, true),
        });
    }

    function removePower(uuid) {
        $item.update({
            "system.powers": $item.system.powers.filter((uuid2) => uuid != uuid2),
        });
    }
</script>

<main use:dropDocs={{ handle: handleDropPower, allow: allowDropPower }}>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <div style="grid-area: name">
            <label for="name">Name:</label>
            <input name="name" type="text" use:updateDoc={{ doc, path: "name" }} />
        </div>
        <div style="grid-area: tabs">
            <Tabs horizontal={false} {tabs} bind:selected={$selected_tab} />
        </div>
    </header>

    <!-- Sheet Body -->
    <section class="sheet-body">
        {#if $selected_tab === "ICON.BondSheet.Details"}
            <div class="flexcol">
                <h3>Description</h3>
                <ProseMirrorEditor doc={$doc} path={"system.description"} />

                <EditableDocArray title="Ideals" path={"system.ideals"} />

                <div class="flexrow">
                    <div>
                        <h3><label for="strain_cap">Max Strain</label></h3>
                        <input name="strain_cap" type="number" use:updateDoc={{ doc, path: "system.strain_cap" }} />
                    </div>
                    <div>
                        <h3><label for="effort_cap">Max Effort</label></h3>
                        <input name="effort_cap" type="number" use:updateDoc={{ doc, path: "system.effort_cap" }} />
                    </div>
                </div>

                <h3>Second Wind:</h3>
                <ProseMirrorEditor doc={$doc} path={"system.second_wind"} />

                <h3>Special Ability:</h3>
                <ProseMirrorEditor doc={$doc} path={"system.special_ability"} />

                <EditableDocArray title="Action Upgrades" path={"system.plus_two_options"} />
            </div>
        {:else if $selected_tab === "ICON.BondSheet.Abilities"}
            <div class="flexcol">
                <h2>Powers</h2>
                {#each $item.system.powers as item}
                    <PreviewItem uuid={item}>
                        <svelte:fragment slot="controls">
                            <i class="fas fa-trash fa-lg" on:click={() => removePower(item)} />
                        </svelte:fragment>
                        <svelte:fragment slot="content" let:doc>
                            {@html doc.system.description}
                        </svelte:fragment>
                    </PreviewItem>
                {/each}
            </div>
        {:else if $selected_tab === "ICON.BondSheet.Gear"}
            <span> TODO: Gear </span>
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
        grid-template: "pic name tabs" 120px / 120px 1fr 1fr;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 140px);
    }
</style>
