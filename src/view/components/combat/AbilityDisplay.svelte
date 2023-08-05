<script>
    import { getContext } from "svelte";
    import RichTextDisplay from "../generic/RichTextDisplay.svelte";
    import { IconItem } from "../../../documents/item";
    import AbilityDetail from "./AbilityDetail.svelte";
    import { tooltip } from "@svelte-plugins/tooltips";

    let actor = getContext("tjs_actor");

    // Either an ability choice or a trait
    export let selection;
    let selectedItem = null;
    $: selectedItem = selection ? (selection instanceof IconItem ? selection : selection.ability) : null;

    async function rollAbility() {
        if (selectedItem.type === "ability") {
            await ChatMessage.create({
                [`flags.${game.system.id}.data`]: {
                    type: "ability",
                    ability_uuid: selectedItem.uuid,
                    tokens: {}
                },
            });
        } else {
            console.log("Posting cringe, are ye?");
        }
    }

    /** Opens the sheet for the selected item */
    function editSelected() {
        selectedItem.sheet.render(true, { focus: true });
    }

    /** Deletes the selected item. choices are deleted individually first. */
    function deleteSelected() {
        if (selectedItem.type === "trait" || selectedItem.system.choices.length === 1) {
            // Delete the item entirely
            selectedItem.delete();
        } else {
            // Just remove the given choice
            selectedItem.update({
                "system.choices": selectedItem.filter((x) => x != selection),
            });
        }
    }
</script>

<div class="preview">
    {#if !selection}
        <h3>Select an ability</h3>
    {:else if selection.ability}
        <AbilityDetail choice={selection} />
    {:else if selection.type === "trait"}
        <h3>{selection.name}</h3>
        <RichTextDisplay body={selection.system.description} />
    {:else}
        <span>ERROR</span>
    {/if}
    {#if selection}
        <div class="bottom-controls">
            <i class="fas fa-edit" on:click={editSelected} use:tooltip={{ content: "Edit" }} />
            <i class="fas fa-trash" on:click={deleteSelected} use:tooltip={{ content: "Delete" }} />
            <i class="fas fa-dice-d20" on:click={rollAbility} use:tooltip={{ content: "Activate" }} />
        </div>
    {/if}
</div>

<style lang="scss">
    .preview {
        height: 100%;
        padding: 5px;
        display: flex;
        flex-direction: column;

        .bottom-controls {
            margin-top: auto;
            display: flex;
            flex-direction: row-reverse;
            i {
                cursor: pointer;
                padding-right: 5px;
            }
        }
    }
</style>
