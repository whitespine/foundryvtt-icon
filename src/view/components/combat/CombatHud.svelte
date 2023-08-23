<script>
    import { getContext } from "svelte";
    import { IconItem } from "../../../documents/item";
    import CombatDisplay from "./CombatDisplay.svelte";
    import StatusDisplay from "./StatusDisplay.svelte";
    import { chapterIcon } from "../../../util/misc";
    import { dragAsDoc } from "../../actions/drag";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

    let actor = getContext("tjs_actor");

    // Props
    const name_alphabetical = (a, b) => a.name.localeCompare(b.name);
    const abilities = actor.embedded.create(Item, {
        name: "abilities",
        filters: [(i) => i.type === "ability" && !i.system.trait],
        sort: name_alphabetical,
    });
    const traits = actor.embedded.create(Item, {
        name: "traits",
        filters: [(i) => i.type === "ability" && i.system.trait],
        sort: name_alphabetical,
    });
    const relics = actor.embedded.create(Item, {
        name: "relics",
        filters: [(i) => i.type === "relic"],
        sort: name_alphabetical,
    });

    // State

    /**
     * @type {TJSDocument<IconItem | undefined>}
     * Either the selected trait, or the selected choice of an ability
     */
    let selected = new TJSDocument(undefined);

    function selectItem(item) {
        if (selected === item) {
            selected = null;
        } else {
            selected = new TJSDocument(item);
        }
    }
</script>

<div class="combat-grid">
    <div class="abilities">
        {#if [...$abilities].length}<h3>Abilities</h3>{/if}
        {#each [...$abilities] as ability (ability.id ?? "err")}
            <div
                class="ability"
                on:click={() => selectItem(ability)}
                class:selected={ability === $selected}
                draggable="true"
                use:dragAsDoc={{ doc: ability }}
            >
                <img class="icon" src={ability.img} alt={ability.name} />
                <span>{chapterIcon(ability.system.chapter)} {ability.name}</span>
                <span style="margin-left: auto">
                    {ability.system.choices[0].actionPips}
                </span>
            </div>
        {/each}
        {#if [...$traits].length}<h3>Traits</h3>{/if}
        {#each [...$traits] as trait (trait.id ?? "err")}
            <div
                class="trait"
                on:click={() => selectItem(trait)}
                class:selected={trait === $selected}
                draggable="true"
                use:dragAsDoc={{ doc: trait }}
            >
                <img class="icon" src={trait.img} alt={trait.name} />
                <span>{chapterIcon(trait.system.chapter)} {trait.name}</span>
            </div>
        {/each}
        {#if [...$relics].length}<h3>Relics</h3>{/if}
        {#each [...$relics] as relic (relic.id ?? "err")}
            <div
                class="relic"
                on:click={() => selectItem(relic)}
                class:selected={relic === $selected}
                draggable="true"
                use:dragAsDoc={{ doc: relic }}
            >
                <img class="icon" src={relic.img} alt={relic.name} />
                <span>{chapterIcon(relic.system.rank)} {relic.name}</span>
            </div>
        {/each}
    </div>

    <div class="preview">
        <CombatDisplay item={$selected} />
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
            "abilities preview" 2fr
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

            .ability,
            .trait,
            .relic {
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
