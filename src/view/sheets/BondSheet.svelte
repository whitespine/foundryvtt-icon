<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import Portrait from "../components/Portrait.svelte";
    import EditableDocArray from "../components/generic/EditableDocArray.svelte";

    let actor = getContext("tjs_actor");
    let item = getContext("tjs_item"); // Alias
    let doc = item;
</script>

<main>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <div style="grid-area: bond_name">
            <label for="name">Name:</label>
            <input name="name" type="text" use:updateDoc={{ doc, path: "name" }} />
        </div>
    </header>

    <!-- Sheet Body -->
    <section class="sheet-body">
        <div class="flexcol">
            <label for="description">Description:</label>
            <textarea name="description" use:updateDoc={{ doc, path: "system.description" }} rows="5" />

            <EditableDocArray title="Ideals" path={"system.ideals"}></EditableDocArray>

            <label for="second_wind">Second Wind:</label>
            <textarea name="second_wind" use:updateDoc={{ doc, path: "system.second_wind" }} rows="5" />

            <label for="special_ability">Special Ability:</label>
            <textarea name="special_ability" use:updateDoc={{ doc, path: "system.special_ability" }} rows="5" />

            <EditableDocArray title="Action Upgrades" path={"system.plus_two_options"}></EditableDocArray>

            <span> TODO: Gear, powers list, etc </span>
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
            "pic bond_name" 120px / 120px 1fr;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 140px);
    }
</style>
