<svelte:options accessors={true} />

<script>
    import { ApplicationShell } from "#runtime/svelte/component/core";

    import { TJSProseMirror } from "#standard/component";

    export let doc;
    export let path;

    /**
     * You can set a document to load / save content from given a `fieldName` in the format of `a.b.c`.
     * When you set a document you can also enable collaboration.
     *
     * The simplest example is:
     *
     * <TJSProseMirror options={{document: <doc>, fieldName: 'some.data.path'}} />
     *
     * The following options data is mostly commented out. For the most part though the values shown for configuration
     * show the default values _or_ in some cases the type of data that you need to set.
     */
    let options;
    $: options = {
        document: doc, // An item to edit description; note: replace w/ valid doc.
        fieldName: path, // Path to data in `a.b.c`; note: this is a v10 field name.
        collaborate: true, // Enables collaboration; requires document.
        button: false, // Show edit button to launch editor when hovered; when false editor is open by default.
        // classes: ['foo', 'bar'],   // Adds additional classes to `.tjs-editor` element.
        // clickToEdit: false,  // Clicking editor content initializes the editor; hides the edit button.
        // DOMPurify,        // You can pass DOMPurify from `#runtime/dompurify though ProseMirror does
        // essential client side sanitation; IE stripping `<script>` tags, etc.
        editable: true, // Enable / disable editing
        enrichContent: true, // The default is true, but if you set it to false content is not enriched.
        initialSelection: "start", // The initial selection / cursor position: 'all', 'end', or 'start'.
        // styles: { '--tjs-editor-toolbar-background': 'red' } // Apply any inline styles / CSS variables
    };
</script>

<div>
    <TJSProseMirror
        {options}
        on:editor:cancel={() => console.log("! event - editor:cancel")}
        on:editor:document:deleted={() => console.log("! event - editor:document:deleted")}
        on:editor:enrichedContent={(event) =>
            console.log(`! event - editor:enrichedContent - ${event.detail.enrichedContent}`)}
        on:editor:save={(event) => console.log(`! event - editor:save - ${event.detail.content}`)}
        on:editor:start={() => console.log("! event - editor:start")}
    />
</div>

<style lang="scss">
    div {
        border: var(--primary-border);
        border-radius: 10px;
        padding-top: 10px;
        padding-bottom: 10px;
    }
</style>
