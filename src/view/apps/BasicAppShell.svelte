<svelte:options accessors={true} />

<script>
    import { ApplicationShell } from "#runtime/svelte/component/core";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
    import { TJSProseMirror } from "#standard/component";

    export let elementRoot;

    let actor = new TJSDocument(game.actors.contents[0]);
    let base_options = {
        document: $actor,
        fieldName: "name",
        collaborate: true,
        button: true,
        editable: true,
        initialSelection: "start",
    };
</script>

<ApplicationShell bind:elementRoot>
    <main>
        <h1>Basic application</h1>
        <span>{$actor.name}</span>
        <div>
        <TJSProseMirror options={base_options} />
        </div>
        <div>
        <TJSProseMirror options={base_options} />
        </div>

    </main>
</ApplicationShell>

<style lang="scss">
    main {
        text-align: center;
        display: flex;
        flex-direction: column;
    }
</style>
