<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import Portrait from "../components/Portrait.svelte";
    import EditableDocArray from "../components/generic/EditableDocArray.svelte";
    import ProseMirrorEditor from "../components/generic/ProseMirrorEditor.svelte";

    let actor = getContext("tjs_actor");
    let item = getContext("tjs_item"); // Alias
    let doc = item;
</script>

<main>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <div style="grid-area: name">
            <label for="name">Name:</label>
            <input name="name" type="text" use:updateDoc={{ doc, path: "name" }} />
        </div>
    </header>

    <!-- Sheet Body -->
    <section class="sheet-body">
        <div class="flexcol">
            <span>Description:</span>
            <ProseMirrorEditor doc={$doc} path={"system.description"} />

            <EditableDocArray title="Ideals" path={"system.ideals"} />

            <div class="flexrow">
                <div>
                    <label for="strain_cap">Max Strain</label>
                    <input name="strain_cap" type="number" use:updateDoc={{doc, path: "system.strain_cap"}} />
                </div>
                <div>
                    <label for="effort_cap">Max Effort</label>
                    <input name="effort_cap" type="number" use:updateDoc={{doc, path: "system.effort_cap"}} />
                </div>
            </div>

            <span>Second Wind:</span>
            <ProseMirrorEditor doc={$doc} path={"system.second_wind"} />

            <span>Special Ability:</span>
            <ProseMirrorEditor doc={$doc} path={"system.special_ability"} />

            <EditableDocArray title="Action Upgrades" path={"system.plus_two_options"} />

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
        grid-template: "pic name" 120px / 120px 1fr;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 140px);
    }
</style>
