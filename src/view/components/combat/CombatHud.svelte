<script>
    import { getContext } from "svelte";
    import { IconItem } from "../../../documents/item";
    import AbilityDisplay from "./AbilityDisplay.svelte";
    import StatusDisplay from "./StatusDisplay.svelte";

    let actor = getContext("tjs_actor");

    let unique_prefix = getContext("unique_prefix");

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
</script>

<div class="combat-grid">
    <div class="abilities">
        <h3>Abilities</h3>
        {#each abilities as ability (ability.id)}
            {#each ability.system.choices as choice, i}
                {#if i >= 1}
                    <i class="fas fa-grip-lines-vertical interlink" />
                {/if}
                <div class="ability" on:click={() => selectItem(choice)} class:selected={choice === selected}>
                    <img class="icon" src={ability.img} alt={choice.name || choice.ability.name} />
                    <span>{choice.name || choice.ability.name}</span>
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
                <span>{trait.name}</span>
            </div>
        {/each}
    </div>

    <div class="preview">
        <AbilityDisplay
            on:clear={() => (selected = null)}
            selection={selected}
            key={`${unique_prefix}_${selectedItem?.id}`}
        />
    </div>

    <div class="statuses">
        <StatusDisplay />
    </div>
</div>

<style lang="scss">
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
            border-right: var(--primary-border);
            overflow: auto;

            .interlink {
                margin-top: -4px;
                margin-bottom: -4px;
            }

            .ability,
            .trait {
                width: calc(100% - 20px);
                display: flex;
                flex-direction: row;
                border: var(--primary-border);
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
                    background-color: var(--secondary-background);
                    color: var(--secondary-color);
                }
            }
        }

        .preview {
            grid-area: preview;
            border-bottom: var(--primary-border);
        }

        .statuses {
            padding: 5px;
            grid-area: statuses;
            display: flex;
            flex-direction: column;
        }
    }
</style>
