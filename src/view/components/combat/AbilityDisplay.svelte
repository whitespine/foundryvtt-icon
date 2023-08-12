<script>
    import { createEventDispatcher, getContext } from "svelte";
    import AbilityDetail from "./AbilityDetail.svelte";
    import { TJSDialog } from "#runtime/svelte/application";
    import { BoonBaneApplication } from "../../apps/BoonBaneApplication";

    // Needed for token elements
    export let key;

    // An ability
    export let ability;

    async function rollChoice(index) {
        let choice = ability.system.choices[index];
        let boon = 0;
        // Prompt boon if we are an attack
        if (choice.is_attack) {
            boon = await BoonBaneApplication.promptBoonBane({
                content: `Select Boons/Banes for ${choice.name} Attack Roll`,
            });
        }
        await ChatMessage.create({
            [`flags.${game.system.id}.data`]: {
                type: "ability",
                ability_uuid: ability.uuid,
                choice_index: index,
                boon,
            },
        });
    }

    /** Opens the sheet for the selected item */
    function editSelected() {
        ability.sheet.render(true, { focus: true });
    }

    const dispatch = createEventDispatcher();

    /** Deletes the selected item. */
    function deleteSelected() {
        TJSDialog.confirm({
            content: `Delete ${ability.name}?`,
            onYes: () => {
                // Delete the item entirely
                ability.delete();

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
                <i class="fas fa-dice-d20" on:click={() => rollChoice(i)} data-tooltip="Activate" />
            </div>
        {/each}
    {/if}
    {#if ability}
        <div class="bottom-controls">
            <i class="fas fa-edit" on:click={editSelected} data-tooltip="Edit" />
            <i class="fas fa-trash" on:click={deleteSelected} data-tooltip="Delete" />
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
