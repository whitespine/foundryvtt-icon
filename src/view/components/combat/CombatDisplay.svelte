<script>
    import AbilityDetail from "./AbilityDetail.svelte";
    import { BoonBaneApplication } from "../../apps/BoonBaneApplication";
    import { dragAsMark } from "../../actions/drag";
    import RichTextDisplay from "../generic/RichTextDisplay.svelte";
    import { confirmDeleteDocument } from "../../../util/misc";
    import { abilityChoiceToStatus } from "../../../config/statuses";

    // An ability (trait) or a relic. Can be null
    export let item = null;

    // Roll a specific ability
    async function rollChoice(index) {
        let choice = item.system.choices[index];
        let attack = null;
        // Prompt boon if we are an attack
        if (choice.is_attack) {
            let boon = await BoonBaneApplication.promptBoonBane({
                content: `Select Boons/Banes for ${choice.name} Attack Roll`,
            });
            let attack_roll_formula = boon === 0 ? "1d20" : boon > 0 ? `1d20 + ${boon}d6kh1` : `1d20 - ${-boon}d6kh1`;
            attack = new Roll(attack_roll_formula);
            await attack.roll();
        }
        await ChatMessage.create({
            [`flags.${game.system.id}`]: {
                svelte_msg_type: "ability",
                ability_uuid: item.uuid,
                choice_index: index,
                roll: attack,
            },
            rolls: attack ? [attack] : [],
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            sound: CONFIG.sounds.dice,
            content: "<div />",
        });
    }

    // Post a specific relic
    async function postRank(index) {
        let choice = item.system.ranks[index];
        await ChatMessage.create({
            content: `<h3>${item.name} Rank ${index + 1}:</h3>${choice.text}`,
        });
    }

    /** Opens the sheet for the selected item */
    function editSelected() {
        item.sheet.render(true, { focus: true });
    }

    /** Deletes the selected item. */
    function deleteSelected() {
        confirmDeleteDocument(item);
    }

    /** Apply as a status effect to self */
    function applyToSelf(choice) {
        let status_data = abilityChoiceToStatus(choice);
        item?.actor?.createEmbeddedDocuments("ActiveEffect", [status_data]);
    }
</script>

<div class="preview">
    {#if !item}
        <h3>Select an ability</h3>
    {:else}
        {#if item.type === "ability"}
            {#each item.system.choices as choice, i}
                <div class="choice" class:bottomed={i < item.system.choices.length - 1}>
                    <AbilityDetail {choice} style="flex: auto" />
                    <div class="controls">
                        <div>
                            <i
                                class="clickable fas fa-dice-d20 fa-xl"
                                on:click={() => rollChoice(i)}
                                data-tooltip="Activate Ability"
                            />
                        </div>
                        <div>
                            <i
                                class="clickable fas fa-flask fa-xl"
                                draggable="true"
                                use:dragAsMark={{ choice }}
                                on:click={() => applyToSelf(choice)}
                                data-tooltip="Drag To Mark, Click to Apply to self. Use for stances, marks, and power dice!"
                            />
                        </div>
                    </div>
                </div>
            {/each}
        {:else if item.type === "relic"}
            {#each item.system.ranks.slice(0, item.system.rank.value) as rank, i}
                <div class="rank" class:bottomed={i < item.system.rank}>
                    <div>
                        <RichTextDisplay body={rank.text} />
                    </div>
                    <i class="clickable fas fa-xl fa-dice-d20" on:click={() => postRank(i)} data-tooltip="Activate" />
                </div>
            {/each}
        {/if}
        <div class="bottom-controls">
            <i class="clickable fas fa-edit" on:click={editSelected} data-tooltip="Edit" />
            <i class="clickable fas fa-trash" on:click={deleteSelected} data-tooltip="Delete" />
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

            .controls {
                display: flex;
                flex-direction: column;
                align-items: center;
                i {
                    margin-top: 20px;
                }
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
</style>
