<script>
    import { getContext } from "svelte";
    import { stepwiseResolveDotpath } from "../../util/paths";
    import HydratedEffectBlock from "./generic/HydratedEffectBlock.svelte";
    import { IconItem } from "../../documents/item";

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

    function rollAbility() {
        console.log("Ability");
    }

    function postTrait() {
        console.log("Trait");
    }

    function saveAgainst(effect) {
        console.log("Save");
    }

    function saveAgainstAll(effect) {
        console.log("SaveAll");
    }

    function editSelected() {
        selectedItem.render(true, {focus: true});
    }
    
    function deleteSelected() {
        if(selectItem.type === "trait" || selectedItem.system.choices.length === 1) {
            // Delete the item entirely
            selectedItem.delete();
        } else {
            // Just remove the given choice
            selectedItem.update({
                "system.choices": selectedItem.filter(x => x != selected)
            });
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
        {#if !selected}
            <h3>Select an ability</h3>
        {:else if selected.ability}
            <h3>{selected.name}</h3>
            <div class="flexrow">
                <span>
                    {selected.ranges.join(", ")}
                </span>
                <span style="margin-left: auto;">
                    {selected.tags.join(", ")}
                </span>
            </div>
            {#each selected.effects as effect}
                <HydratedEffectBlock body={effect} />
            {/each}
        {:else if selected.type === "trait"}
            <h3>{selected.name}</h3>
            <HydratedEffectBlock body={selected.system.description} />
        {:else}
            <span>ERROR</span>
        {/if}
        <div class="bottom-controls">
            <i class="fas fa-edit" on:click={editSelected} />
            <i class="fas fa-trash" on:click={deleteSelected} />
        </div>
    </div>

    <div class="statuses">
        <h3>Statuses</h3>
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
            padding: 5px;
            grid-area: preview;
            border-bottom: $border;
            display: flex;
            flex-direction: column;

            .bottom-controls {
                margin-top: auto;
                justify-items: end;
                display: flex;
                flex-direction: row-reverse;
                i {
                    cursor: pointer;
                    padding-right: 5px;
                }
            }
        }

        .statuses {
            padding: 5px;
            grid-area: statuses;
            display: flex;
            flex-direction: column;
        }
    }
</style>
