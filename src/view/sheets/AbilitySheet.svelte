<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
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
</script>

<main>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <input style="grid-area: ability_name" type="text" use:updateDoc={{ doc, path: "name" }} />
        <input style="grid-area: chapter" type="text" use:updateDoc={{ doc, path: "system.chapter" }} />
        <div class="flexrow" style="grid-area: tabs">
            <Tabs horizontal={true} tabs={tab_choices} bind:selected={selected_tab} />
            <i class="add-choice fas fa-plus" on:click={() => addChoice()} />
        </div>
    </header>

    <!-- Sheet Body -->
    <section class="sheet-body">
        <div class="flexcol">
            <EditableDocArray title="Special Requirements" path={"system.special_requirements"} />
            <label for="name">Name:</label>
            <input name="name" type="text" use:updateDoc={{ doc, path: `system.choices.${selected_tab}.name` }} />

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

            <EditableDocArray title="Ranges" path={`system.choices.${selected_tab}.ranges`} numeric={true} />

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

            <EditableDocArray title="Tags" path={`system.choices.${selected_tab}.tags`} />

            <EditableDocArray title="Effects" path={`system.choices.${selected_tab}.effects`} />
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

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 140px);
    }

    .add-choice {
        cursor: pointer;
    }
</style>
