<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import Portrait from "../components/Portrait.svelte";
    import Tabs from "../components/generic/Tabs.svelte";
    import { GENERIC_COLORS, PLAYER_COLORS } from "../../models/items/job";
    import { localize, simpleMixList } from "../../util/misc";
    import ProseMirrorEditor from "../components/generic/ProseMirrorEditor.svelte";
    import { dropDocs } from "../actions/drop";
    import PreviewItem from "../components/preview/PreviewItem.svelte";
    import { TAB_STORES } from "../../util/stores/tabs";
    import AbilityDetail from "../components/combat/AbilityDetail.svelte";

    let actor = getContext("tjs_actor");
    let item = getContext("tjs_item");
    let doc = item;

    // Set our tabs
    const tabs = ["ICON.JobSheet.Details", "ICON.JobSheet.Abilities", "ICON.JobSheet.Attributes"].map((s) => ({
        label: localize(s),
        key: s,
    }));
    let selected_tab = TAB_STORES.get($actor.uuid, "ICON.JobSheet.Details");

    /**
     *
     * @param {Item} doc The dropped document
     */
    function allowDropAbility(doc) {
        // A very simple requirement
        return doc.type === "ability";
    }

    /**
     *
     * @param {Item} doc The dropped document
     */
    function handleDropAbility(doc, event) {
        // Just add it to the end of the list
        let effective_target = event.target.closest("[data-uuid]")?.dataset.uuid;
        if (doc.system.choices.some((x) => x.limit_break)) {
            // It's a limit break
            $item.update({
                "system.limit_break": doc.uuid,
            });
        } else if (doc.system.trait) {
            // It's not a limit break, and is a trait
            $item.update({
                "system.traits": simpleMixList($item.system.traits, doc.uuid, effective_target, true),
            });
        } else {
            // It's an ability
            $item.update({
                "system.abilities": simpleMixList(
                    $item.system.abilities,
                    doc.uuid,
                    effective_target,
                    true
                ),
            });
        }
    }

    function removeAbility(uuid) {
        $item.update({
            "system.limit_break": $item.system.limit_break === uuid ? null : $item.system.limit_break,
            "system.traits": $item.system.traits.filter((uuid2) => uuid != uuid2),
            "system.abilities": $item.system.abilities.filter((uuid2) => uuid != uuid2),
        });
    }
</script>

<main use:dropDocs={{ handle: handleDropAbility, allow: allowDropAbility }}>
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
        {#if $selected_tab === "ICON.JobSheet.Details"}
            <div class="flexcol">
                <h3>Description:</h3>
                <ProseMirrorEditor doc={$doc} path={"system.description"} />
            </div>
        {:else if $selected_tab === "ICON.JobSheet.Abilities"}
            <div class="flexcol">
                {#each [["Limit Break", [$item.system.limit_break]], ["Traits", $item.system.traits], ["Abilities", $item.system.abilities]] as [category, items]}
                    <h2>{category}</h2>
                    {#each items as item}
                        <PreviewItem uuid={item}>
                            <svelte:fragment slot="controls">
                                <i class="fas fa-trash fa-lg" on:click|stopPropagation={() => removeAbility(item)} />
                            </svelte:fragment>
                            <svelte:fragment slot="content" let:doc={resolved}>
                                {#each resolved?.system.choices ?? [] as choice}
                                    <AbilityDetail {choice} />
                                {/each}
                            </svelte:fragment>
                        </PreviewItem>
                    {/each}
                {/each}
            </div>
        {:else if $selected_tab === "ICON.JobSheet.Attributes"}
            <div class="flexcol">
                <label for="color">Color</label>
                <select name="color" use:updateDoc={{ doc, path: "system.class.color" }}>
                    {#each PLAYER_COLORS as c, i}
                        <option value={GENERIC_COLORS[i]}>{c}</option>
                    {/each}
                </select>
                {#each ["defense", "damage_die", "fray_damage", "speed", "dash", "vitality", "armor"] as stat}
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
        grid-template: "pic name tabs" 120px / 120px 1fr 1fr;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 140px);
    }
</style>
