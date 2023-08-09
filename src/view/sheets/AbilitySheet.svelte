<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import { dropDocs } from "../actions/drop";
    import Portrait from "../components/Portrait.svelte";
    import EditableDocArray from "../components/generic/EditableDocArray.svelte";
    import Tabs from "../components/generic/Tabs.svelte";

    let actor = getContext("tjs_actor");
    let item = getContext("tjs_item"); // Alias
    let doc = item;

    // Our tab
    let tab_choices = [];
    $: tab_choices = $item.system.choices.map((s, i) => ({
        label: s.name ?? `${i + 1}`,
        key: i,
    }));
    let selected_tab = 0;
    let selected_choice = {};
    $: selected_choice = $item.system.choices[selected_tab];

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
            [`system.choices.${selected_tab}.summons`]: summons,
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
            [`system.choices.${selected_tab}.summons`]: summons,
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
                <Tabs horizontal={true} tabs={tab_choices} bind:selected={selected_tab} />
            </div>
            <i class="add-choice fas fa-plus" on:click={() => addChoice()} />
        </div>
    </header>

    <!-- Sheet Body -->
    <section class="sheet-body">
        <div class="flexcol">
            <label for="name">Name:</label>
            <input name="name" type="text" use:updateDoc={{ doc, path: `system.choices.${selected_tab}.name` }} />

            <label for="description">Description:</label>
            <textarea name="description" use:updateDoc={{ doc, path: `system.choices.${selected_tab}.description` }} rows="5" />

            <label for="actions">Actions:</label>
            <input
                name="actions"
                type="number"
                use:updateDoc={{ doc, path: `system.choices.${selected_tab}.actions` }}
            />

            <label for="trigger">Interrupt Trigger:</label>
            <input name="trigger" type="text" use:updateDoc={{ doc, path: `system.choices.${selected_tab}.trigger` }} />

            <label for="round_action">Round Action:</label>
            <input
                name="round_action"
                type="checkbox"
                use:updateDoc={{ doc, path: `system.choices.${selected_tab}.round_action` }}
            />

            <label for="combo">Combo:</label>
            <select name="combo" use:updateDoc={{ doc, path: `system.choices.${selected_tab}.combo` }}>
                {#each [["None", 0], ["Start", 1], ["Finisher", -1]] as c}
                    <option value={c[1]}>{c[0]}</option>
                {/each}
            </select>
            <label for="resolve">Resolve:</label>
            <input
                name="resolve"
                type="number"
                use:updateDoc={{ doc, path: `system.choices.${selected_tab}.resolve` }}
            />

            <EditableDocArray title="Ranges" path={`system.choices.${selected_tab}.ranges`} />

            <EditableDocArray title="Tags" path={`system.choices.${selected_tab}.tags`} />

            <EditableDocArray title="Effects" path={`system.choices.${selected_tab}.effects`} />

            <EditableDocArray title="Special Requirements" path={"system.special_requirements"} />

            <div class="flexcol">
                <h3>Summons <em> - Drag onto this sheet to add! </em></h3>
                {#each selected_choice.summons as uuid, index}
                    <div class="flexrow">
                        <input
                            type="text"
                            use:updateDoc={{ doc, path: `system.choices.${selected_tab}.summons.${index}` }}
                        />
                        <span>
                            {#await fromUuid(uuid)}
                                Loading...
                            {:then actor}
                                {#if actor}
                                    {actor.name}
                                {:else}
                                    NOT FOUND
                                {/if}
                            {:catch}
                                INVALID
                            {/await}
                        </span>
                        <i class="fas fa-trash" on:click={() => deleteSummon(index)} />
                    </div>
                {/each}
            </div>
        </div>
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
