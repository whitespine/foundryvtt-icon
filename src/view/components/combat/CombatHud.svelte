<script>
    import { getContext } from "svelte";
    import { IconItem } from "../../../documents/item";
    import AbilityDisplay from "./AbilityDisplay.svelte";
    import StatusDisplay from "./StatusDisplay.svelte";

    let actor = getContext("tjs_actor");

    // Props
    export let abilities = [];
    export let traits = [];

    // State

    /**
     * @type {IconItem | object | null}
     * Either the selected trait, or the selected choice of an ability
     */
    let selected = null;
    let selectedItem = null;
    $: selectedItem = selected ? (selected instanceof IconItem ? selected : selected.ability) : null;

    function selectItem(item) {
        if (selected === item) {
            selected = null;
        } else {
            selected = item;
        }
    }

    function chapter_symbol(chapter) {
        if(chapter == 1) {
            return "Ⅰ";
        } else if(chapter == 2){
            return "Ⅱ";
        } else if(chapter == 3) {
            return "Ⅲ";
        } else {
            console.error(chapter);
        }
    }
</script>

<div class="combat-grid">
    <div class="abilities">
        <h3>Abilities</h3>
        {#each abilities as ability (ability.id)}
            {#each ability.system.choices as choice (choice.name)}
                <div class="ability" on:click={() => selectItem(choice)} class:selected={choice === selected}>
                    <img class="icon" src={ability.img} alt={choice.name || choice.ability.name} />
                    <span>{choice.name || choice.ability.name} {chapter_symbol(ability.system.chapter)}</span>
                    <span style="margin-left: auto">
                        {choice.actionPips}
                    </span>
                </div>
            {/each}
        {/each}
        <h3>Traits</h3>
        {#each traits as trait (trait.id)}
            <div class="trait" on:click={() => selectItem(trait)} class:selected={trait === selected}>
                <img class="icon" src={trait.img} alt={trait.name} />
                <span>{trait.name} {chapter_symbol(trait.system.chapter)}</span>
            </div>
        {/each}
    </div>

    <div class="preview">
        <AbilityDisplay selection={selected} />
    </div>

    <div class="statuses">
        <StatusDisplay />
    </div>
</div>

<style lang="scss">
    $border: solid black 1px;
    .combat-grid {
        height: 100%;
        display: grid;
        grid-template:
            "abilities preview" 1fr
            "abilities statuses" 1fr / 1fr 2fr;

        h3 {
            max-width: fit-content;
            align-self: center;
        }

        .abilities {
            grid-area: abilities;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-right: $border;
            overflow: auto;

            .ability,
            .trait {
                width: calc(100% - 20px);
                display: flex;
                flex-direction: row;
                border: 1px solid black;
                padding: 5px;
                margin: 2px;
                cursor: pointer;
                font-weight: bold;
                align-items: center;

                .icon {
                    width: 24px;
                    height: 24px;
                }

                span {
                    margin-left: 5px;
                }

                &.selected {
                    background-color: rgba(46, 40, 73, 0.5);
                }
            }
        }

        .preview {
            grid-area: preview;
            border-bottom: $border;
        }

        .statuses {
            padding: 5px;
            grid-area: statuses;
            display: flex;
            flex-direction: column;
        }
    }
</style>
