<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import Portrait from "../components/Portrait.svelte";
    import EditableDocArray from "../components/generic/EditableDocArray.svelte";
    import ProseMirrorEditor from "../components/generic/ProseMirrorEditor.svelte";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias
</script>

<main>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />

        <div style="grid-area: options">
            <label for="object"><h3>Object?:</h3></label>
            <input name="object" type="checkbox" use:updateDoc={{ doc, path: `system.is_object` }} />
        </div>
        <div style="grid-area: name">
            <label for="name"><h3>Name:</h3></label>
            <input name="name" type="text" use:updateDoc={{ doc, path: "name" }} />
        </div>
    </header>

    <!-- Sheet Tab Navigation -->

    <!-- Sheet Body -->
    <section class="sheet-body">
        <div class="flexcol">
            <h3>Summon Effects:</h3>
            <ProseMirrorEditor doc={$doc} path={"system.summon_effects"} />

            <h3>Summon Actions:</h3>
            <ProseMirrorEditor doc={$doc} path={"system.summon_actions"} />

            <EditableDocArray title="Tags" path={"system.tags"} />
        </div>
    </section>
</main>

<style lang="scss">
    main {
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }

    header {
        display: grid;
        grid-template: "pic options name" 90px / 90px 1fr 1fr;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 140px);
    }
</style>
