<script>
    import { getContext } from "svelte";
    import { stepwiseResolveDotpath } from "../../util/paths";
    import HydratedEffectBlock from "./generic/HydratedEffectBlock.svelte";

    let actor = getContext("tjs_actor");

    // Props
    export let abilities = [];
    export let traits = [];

    // State

    /** @type {IconItem | null} */
    let selected = null;

    function selectItem(item) {
        if(selected === item) {
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
        connsole.log("Save");
    }

    function saveAgainstAll(effect) {
        connsole.log("SaveAll");
    }
</script>

<div class="combat-grid">
    <div class="abilities">
        {#each abilities as ability (ability.id)}
            <div class="ability">
                <div class="header" click={() => selectItem(ability)}>
                    <img class="icon" src={ability.img} alt={ability.name}/>
                    <span>{ability.name}</span>
                </div>
            </div>
        {/each}
        {#each traits as trait (trait.id)}
            <div class="trait">
                <div class="header" click={() => selectItem(trait)}>
                    <img class="icon" src={trait.img} alt={trait.name}/>
                    <span>{trait.name}</span>
                </div>
            </div>
        {/each}
    </div>
    <div class="preview">
        {#if !selected}
            <h3>Select an ability</h3>
        {:else if selected.type === "ability"}
            <h2>{selected.name}</h2>

        {:else if selected.type === "trait"}
            <h2>{selected.name}</h2>
            <HydratedEffectBlock body={selected.system.description} />
        {:else}
            <span>ERROR</span>
        {/if}
    </div>
    <div class="statuses" />
</div>

<style lang="scss">
    $border: solid black 1px;
    .combat-grid {
        display: grid;
        grid-template:
            "abilities preview"  1fr
            "abilities statuses" 1fr / 1fr 1fr;

        .abilities {
            grid-area: "abilities";

            .ability, .trait {
                display: flex;
                flex-direction: row;
                border: 1px solid black;
                border-radius: 10px;
                padding: 5px;
                margin: 2px;
                cursor: pointer;
                font-weight: bold;
                align-items: center;

                .icon {
                    width: 24px;
                    height: 24px;
                }

                .header {
                    margin-left: 5px;
                }
            }
        }

        .preview {
            grid-area: "preview";
        }

        .statuses {
            grid-area: "statuses";
        }

        > div {
            border-right: $border;
            border-bottom: $border;
        }
    }

</style>
