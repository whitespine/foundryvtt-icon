<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import { dropDocs } from "../actions/drop";
    import Portrait from "../components/Portrait.svelte";
    import EditableDocArray from "../components/generic/EditableDocArray.svelte";
    import Tabs from "../components/generic/Tabs.svelte";
    import ProseMirrorEditor from "../components/generic/ProseMirrorEditor.svelte";
    import { TAB_STORES } from "../../util/stores";
    import ActorUuidReference from "../components/combat/ActorUUIDReference.svelte";

    let actor = getContext("tjs_actor");
    let item = getContext("tjs_item"); // Alias
    let doc = item;

    // Our tab
    let tab_choices = [];
    $: tab_choices = $item.system.choices.map((s, i) => ({
        label: s.name ?? `${i + 1}`,
        key: i,
    }));
    let selected_tab = TAB_STORES.get($doc.uuid, 0);

    // Fetch selected choice - fix if tab is too high
    let selected_choice = {};
    $: selected_choice = $item.system.choices[$selected_tab];

    function addChoice() {
        $doc.update({
            [`system.choices`]: [...$doc.system.choices, {}],
        });
    }

    // Handle dropped documents
    function handleDrop(drop) {
        let summons = selected_choice.summons;
        summons = [...summons, drop.document.uuid];
        $doc.update({
            [`system.choices.${$selected_tab}.summons`]: summons,
        });
    }

    function allowDrop(drop) {
        return drop.type == "Actor" && ["summon"].includes(drop.document.type);
    }

    // Delete the summon at the specified index for the current choice
    function deleteSummon(index) {
        let summons = selected_choice.summons;
        summons = [...summons.slice(0, index), ...summons.slice(index + 1)];
        $doc.update({
            [`system.choices.${$selected_tab}.summons`]: summons,
        });
    }

    // Delete the currently selected choice
    function deleteCurrentOption() {
        $doc.update({
            [`system.choices`]: [
                ...$doc.system.choices.slice(0, $selected_tab),
                ...$doc.system.choices.slice($selected_tab + 1),
            ],
        });
    }
</script>

<main use:dropDocs={{ handle: handleDrop, allow: allowDrop }}>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <div style="grid-area: ability_name">
            <label for="name">Name:</label>
            <input name="name" type="text" use:updateDoc={{ doc, path: "name" }} />
        </div>
        <div style="grid-area: options">
            <label for="chapter">Chapter:</label>
            <input type="text" name="chapter" use:updateDoc={{ doc, path: "system.chapter" }} />
            <label for="trait">Is Trait?:</label>
            <input type="checkbox" name="trait" use:updateDoc={{ doc, path: "system.trait" }} />
        </div>
        <div class="option-select" style="grid-area: tabs">
            <div>
                <Tabs horizontal={true} tabs={tab_choices} bind:selected={$selected_tab} />
            </div>
            <i class="add-choice fas fa-plus" on:click={() => addChoice()} />
        </div>
    </header>

    <!-- Sheet Body -->
    <section class="sheet-body">
        <div class="flexcol">
            {#if selected_choice}
                <div class="block">
                    <h3><label for="name">Name:</label></h3>
                    <input
                        name="name"
                        type="text"
                        use:updateDoc={{ doc, path: `system.choices.${$selected_tab}.name` }}
                    />
                </div>

                <div class="block">
                    <h3>Narrative Description:</h3>
                    <ProseMirrorEditor doc={$doc} path={`system.choices.${$selected_tab}.description`} />
                </div>

                <div class="flexrow">
                    <div class="block">
                        <h3><label for="actions">Actions:</label></h3>
                        <input
                            name="actions"
                            type="number"
                            use:updateDoc={{ doc, path: `system.choices.${$selected_tab}.actions` }}
                        />
                    </div>

                    <div class="block">
                        <h3><label for="round_action">Round Action:</label></h3>
                        <div class="flexrow">
                            <input
                                name="round_action"
                                type="checkbox"
                                use:updateDoc={{ doc, path: `system.choices.${$selected_tab}.round_action` }}
                            />
                            {#if selected_choice.round_action}
                                Yes
                            {:else}
                                No
                            {/if}
                        </div>
                    </div>

                    <div class="block">
                        <h3><label for="combo">Combo:</label></h3>
                        <select name="combo" use:updateDoc={{ doc, path: `system.choices.${$selected_tab}.combo` }}>
                            {#each [["None", 0], ["Start", 1], ["Finisher", -1]] as c}
                                <option value={c[1]}>{c[0]}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="block">
                        <h3><label for="resolve">Resolve:</label></h3>
                        <input
                            name="resolve"
                            type="number"
                            use:updateDoc={{ doc, path: `system.choices.${$selected_tab}.resolve` }}
                        />
                    </div>
                </div>

                <div class="block">
                    <h3><label for="trigger">Interrupt Trigger:</label></h3>
                    <input
                        name="trigger"
                        type="text"
                        use:updateDoc={{ doc, path: `system.choices.${$selected_tab}.trigger` }}
                    />
                </div>

                <div class="flexrow">
                    <div class="block">
                        <EditableDocArray title="Ranges" path={`system.choices.${$selected_tab}.ranges`} />
                    </div>

                    <div class="block">
                        <EditableDocArray title="Tags" path={`system.choices.${$selected_tab}.tags`} />
                    </div>
                    <div class="block">
                        <h3>Summons <em> - Drag to add! </em></h3>
                        {#each selected_choice.summons as uuid, index}
                            <div class="flexrow">
                                <ActorUuidReference uuid={uuid} />
                                <i class="fas fa-trash" style="max-width: 32px;" on:click={() => deleteSummon(index)} />
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="block">
                    <EditableDocArray title="Effects" path={`system.choices.${$selected_tab}.effects`} />
                </div>

                <div class="block">
                    <EditableDocArray title="Special Requirements" path={"system.special_requirements"} />
                </div>

                {#if $item.system.choices.length > 1}
                    <button on:click={deleteCurrentOption}>Delete Option</button>
                {/if}
            {/if}
        </div>
    </section>
</main>

<style lang="scss">
    main {
        padding: 5px;
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }

    .block {
        border: var(--primary-border);
        padding: 5px;
        margin: -1px;
    }

    header {
        display: grid;
        grid-template:
            "pic ability_name options" 60px
            "pic tabs tabs" 60px / 80px 1fr 1fr;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 140px);
    }

    .option-select {
        display: flex;
        flex-direction: row;
        align-items: center;
        div {
            flex: 1 0 auto;
        }
    }
    i {
        margin-left: auto;
        margin-right: 16px;
        cursor: pointer;
    }
</style>
