<svelte:options accessors={true} />

<script>
    import { ApplicationShell } from "#runtime/svelte/component/core";

    import { TJSProseMirror, TJSTinyMCE } from "#standard/component";

    export let doc;
    export let path;

    // If true, automatically open editor
    export let auto = false;

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
        collaborate: false, // Enables collaboration; requires document.
        button: !auto, // Show edit button to launch editor when hovered; when false editor is open by default.
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

<div class="icon-editor">
    <!--<TJSProseMirror {options} />-->
    <TJSTinyMCE {options} />
</div>

<style lang="scss">
    :global(.icon-editor .prosemirror .editor-container .editor-content) {
        position: relative;
    }

    :global(.icon-editor .editor) {
        position: relative;
        --tjs-editor-toolbar-button-color: var(--primary-color);
        --tjs-editor-content-color: var(--primary-color);
        --tjs-editor-toolbar-select-color: var(--secondary-color);
        --tjs-editor-toolbar-select-background: var(--secondary-background);
        --tjs-editor-toolbar-select-color-hover: var(--tertiary-color);
        --tjs-editor-toolbar-select-background-hover: var(--tertiary-background);
        // --tjs-editor-active-overflow: unset;

    }

    :global(.icon-editor .editor-active) {
        --tjs-editor-height: 200px;
    }

    div {
        border: var(--primary-border);
        border-radius: 5px;
        padding: 4px;
    }
</style>
