<script>
    import { createEventDispatcher, getContext } from "svelte";
    import RichTextDisplay from "../generic/RichTextDisplay.svelte";
    import { IconItem } from "../../../documents/item";
    import AbilityDetail from "./AbilityDetail.svelte";
    import { tooltip } from "@svelte-plugins/tooltips";
    import { TJSDialog } from "#runtime/svelte/application";

    // Needed for token elements
    export let key;

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
                    choice_index: selection.ability ? selection.ability.system.choices.indexOf(selection) : 0,
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

    const dispatch = createEventDispatcher();

    /** Deletes the selected item. choices are deleted individually first. */
    function deleteSelected() {
        TJSDialog.confirm({
            content: `Delete ${selectedItem.name}?`,
            onYes: () => {
                if (selectedItem.type === "trait" || selectedItem.system.choices.length === 1) {
                    // Delete the item entirely
                    selectedItem.delete();
                } else {
                    // Just remove the given choice
                    selectedItem.update({
                        "system.choices": selectedItem.system.choices.filter((x) => x != selection),
                    });
                }
                dispatch("clear");
            },
        });
    }
</script>

<div class="preview">
    {#if !selection}
        <h3>Select an ability</h3>
    {:else if selection.ability}
        <AbilityDetail choice={selection} key={`${key}_ability`} />
    {:else if selection.type === "trait"}
        <h3>{selection.name}</h3>
        <RichTextDisplay body={selection.system.description} key={`${key}_trait`} />
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
