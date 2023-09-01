<script>
    import AbilityDetail from "./AbilityDetail.svelte";
    import { TJSDialog } from "#runtime/svelte/application";
    import { BoonBaneApplication } from "../../apps/BoonBaneApplication";
    import { dragAsMark } from "../../actions/drag";
    import RichTextDisplay from "../generic/RichTextDisplay.svelte";

    // An ability (trait) or a relic. Can be null
    export let item = null;

    // Roll a specific ability
    async function rollChoice(index) {
        let choice = item.system.choices[index];
        let boon = 0;
        // Prompt boon if we are an attack
        if (choice.is_attack) {
            boon = await BoonBaneApplication.promptBoonBane({
                content: `Select Boons/Banes for ${choice.name} Attack Roll`,
            });
        }
        await ChatMessage.create({
            [`flags.${game.system.id}`]: {
                svelte_msg_type: "ability",
                ability_uuid: item.uuid,
                choice_index: index,
                boon,
            },
        });
    }

    // Post a specific relic
    async function postRank(index) {
        let choice = item.system.ranks[index];
        await ChatMessage.create({
            content: `<h3>${item.name} Rank ${index + 1}:</h3>${choice}`,
        });
    }

    /** Opens the sheet for the selected item */
    function editSelected() {
        item.sheet.render(true, { focus: true });
    }

    /** Deletes the selected item. */
    function deleteSelected() {
        TJSDialog.confirm({
            content: `Delete ${item.name}?`,
            onYes: () => {
                // Delete the item entirely
                item.delete();
            },
        });
    }
</script>

<div class="preview">
    {#if !item}
        <h3>Select an ability</h3>
    {:else if item.type === "ability"}
        {#each item.system.choices as choice, i}
            <div class="choice" class:bottomed={i < item.system.choices.length - 1}>
                <AbilityDetail {choice} style="flex: auto" />
                <i class="fas fa-dice-d20 fa-xl" on:click={() => rollChoice(i)} data-tooltip="Activate" />
            </div>
        {/each}
    {:else if item.type === "relic"}
        {#each item.system.ranks.slice(0, item.system.rank.value) as rank, i}
            <div class="rank" class:bottomed={i < item.system.rank}>
                <div>
                    <RichTextDisplay body={rank} />
                </div>
                <i class="fas fa-dice-d20" on:click={() => postRank(i)} data-tooltip="Activate" />
            </div>
        {/each}
    {/if}
    {#if item}
        <div class="bottom-controls">
            <i class="fas fa-bullseye" draggable="true" use:dragAsMark={{ doc: item }} data-tooltip="Drag To Mark" />
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

        .choice,
        .rank {
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
                padding-right: 5px;
            }
        }
    }

    i {
        cursor: pointer;
    }
</style>
