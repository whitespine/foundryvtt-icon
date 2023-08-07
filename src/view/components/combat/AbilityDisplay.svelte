<script>
    import { createEventDispatcher, getContext } from "svelte";
    import RichTextDisplay from "../generic/RichTextDisplay.svelte";
    import { IconItem } from "../../../documents/item";
    import AbilityDetail from "./AbilityDetail.svelte";
    import { tooltip } from "@svelte-plugins/tooltips";
    import { TJSDialog } from "#runtime/svelte/application";

    // Needed for token elements
    export let key;

    // An ability
    export let ability;

    async function rollChoice(index) {
        await ChatMessage.create({
            [`flags.${game.system.id}.data`]: {
                type: "ability",
                ability_uuid: ability.uuid,
                choice_index: index,
            },
        });
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
    {#if !ability}
        <h3>Select an ability</h3>
    {:else}
        {#each ability.system.choices as choice, i}
            <div class="choice" class:bottomed={i < ability.system.choices.length - 1}>
                <AbilityDetail {choice} key={`${key}_ability_${i}`} style="flex: auto" />
                <i class="fas fa-dice-d20" on:click={() => rollChoice(i)} use:tooltip={{ content: "Activate" }} />
            </div>
        {/each}
    {/if}
    {#if ability}
        <div class="bottom-controls">
            <i class="fas fa-edit" on:click={editSelected} use:tooltip={{ content: "Edit" }} />
            <i class="fas fa-trash" on:click={deleteSelected} use:tooltip={{ content: "Delete" }} />
        </div>
    {/if}
</div>

<style lang="scss">
    .preview {
        height: 100%;
        padding: 5px;
        display: flex;
        flex-direction: column;

        .choice {
            display: flex;
            flex-direction: row;
            align-items: center;

            &.bottomed {
                border-bottom: var(--primary-border);
            }
        }

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
