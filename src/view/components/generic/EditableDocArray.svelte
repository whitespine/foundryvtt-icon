<script>
    import { getContext } from "svelte";
    import { resolveDotpath } from "../../../util/paths";
    import { updateDoc } from "../../actions/update";
    import ProseMirrorEditor from "./ProseMirrorEditor.svelte";

    /** @type {string} Title to show */
    export let title = "Title";

    /** @type {string} Path to the array*/
    export let path;

    /** @type {string} Is it numbers? */
    export let numeric = false;

    /** @type {boolean} Should we use a prosemirror editor? */
    export let prose = false;

    let doc = getContext("tjs_doc");

    let array;
    $: array = resolveDotpath($doc, path);

    // Adds an item to the array
    function handleAdd() {
        $doc.update({[path]: [...array, ""]});
    }

    // Delete an item in the array
    function handleDelete(index) {
        $doc.update({[path]: [...array.slice(0, index), ...array.slice(index+1)]});
    }
</script>

<div class="flexcol">
    <h3>{title} <i class="fas fa-plus" on:click={() => handleAdd()}></i></h3>
    {#each array as _item, index}
        <div class="flexrow">
            {#if prose}
                <ProseMirrorEditor doc={$doc} path={`${path}.${index}`} />
            {:else}
                <input type={numeric ? "number" : "text"} use:updateDoc={{doc, path: `${path}.${index}`}} />
            {/if}
            <i class="fas fa-trash" on:click={() => handleDelete(index)}/>
        </div> 
    {/each}
</div>

<style lang="scss">
    i {
        cursor: pointer;
        max-width: 32px;
        padding-left: 12px;
        margin-top: 6px;
    }
</style>


