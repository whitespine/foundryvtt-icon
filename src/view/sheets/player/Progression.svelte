<script>
    import { getContext } from "svelte";
    import { localize } from "../../../util/misc";
    import DocClock from "../../components/generic/DocClock.svelte";
    import BoundedNumberDisplay from "../../components/generic/BoundedNumberDisplay.svelte";
    import { TJSDialog } from "#runtime/svelte/application";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
    import { slide, blur } from "svelte/transition";
    import { updateDoc } from "../../actions/update";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias

    // Total pending xp
    let total_xp;
    $: {
        let xp = $actor.system.xp_tracker;
        total_xp = xp.ideals.value + xp.challenges.value + xp.ambitions.value + xp.burdens.value;
    }

    // Relics
    const name_alphabetical = (a, b) => a.name.localeCompare(b.name);
    const relics = actor.embedded.create(Item, {
        name: "relics",
        filters: [(i) => i.type === "relic"],
        sort: name_alphabetical,
    });

    // Commit all xp and clear all clocks
    function commitXP() {
        $actor.update({
            "system.xp_tracker": {
                "ideal.value": 0,
                "challenges.value": 0,
                "ambitions.value": 0,
                "burdens.value": 0,
            },
            "system.xp": $actor.system.xp.value + total_xp,
        });
    }

    // Reduce xp back to modulo 15 and increment level
    function levelUp() {
        $actor.update({
            "system.xp": $actor.system.xp.value - 15,
            "system.level": $actor.system.level + 1,
        });
    }
    let can_level;
    $: can_level = $actor.system.level < 12 && $actor.system.xp.value >= 15;

    // Show all build warnings
    function showWarnings() {
        TJSDialog.prompt({
            content: $actor.system.progression.warnings.join("<br>"),
        });
    }

    // Upgrade the specified relic
    function upgradeRelic(relic) {
        relic.update({
            "system.rank": relic.system.rank.value + 1,
            "system.infused_dust": relic.system.infused_dust.value - relic.system.infused_dust.max,
        });
    }
</script>

<section>
    <div class="xp">
        <h2>XP Tracking</h2>
        <BoundedNumberDisplay name={localize("ICON.XP")} path="system.xp" />
        {#each [["ICON.XPTracking.Ideal", "system.xp_tracker.ideals"], ["ICON.XPTracking.Challenge", "system.xp_tracker.challenges"], ["ICON.XPTracking.Ambition", "system.xp_tracker.ambitions"], ["ICON.XPTracking.Burdens", "system.xp_tracker.burdens"]] as [text, path]}
            <div class="opportunity">
                <i class="fas fa-chevron-right" />
                <span>{localize(text)}</span>
                <DocClock clock_width="30px" {path} title={false} />
            </div>
        {/each}
        <button on:click={commitXP}>End Session - {total_xp} XP</button>
        {#if can_level}
            <button on:click={levelUp}>Level Up!</button>
        {/if}

        <!-- The two branching paths in character building -->
        {#each [["four", 4], ["eight", 8]] as [key, threshold]}
            {#if $doc.system.level >= threshold}
                <div>
                    <h4>At level {key} I chose:</h4>
                    <div class="flexrow">
                        <select use:updateDoc={{doc, path: `system.level_choices.${key}.combat`}}>
                            <option value="job">+1 Job</option>
                            <option value="mastery">+1 Mastery +2 Abilities</option>
                        </select>
                        <select use:updateDoc={{doc, path: `system.level_choices.${key}.narrative`}}>
                            <option value="actions">+2 Action Pips</option>
                            <option value="power">+1 Bond Power</option>
                        </select>
                    </div>
                </div>
            {/if}
        {/each}


        {#if $actor.system.progression.warnings.length}
            <button on:click={showWarnings}>{$actor.system.progression.warnings.length} Build Warnings</button>
        {/if}
    </div>
    <div class="relics">
        <h2>Relics</h2>
        <BoundedNumberDisplay name={localize("ICON.Dust")} path="system.dust" />
        {#each [...$relics] as relic}
            <div>
                <h3 class="clickable" on:click={() => relic.sheet.render(true, { focus: true })}>{relic.name}</h3>
                <div class="flexrow">
                    {#if relic.system.rank.value < 4}
                        <BoundedNumberDisplay
                            name={localize(relic.system.rank.value < 3 ? "ICON.Upgrade" : "ICON.Aspect")}
                            doc={new TJSDocument(relic)}
                            path="system.infused_dust"
                        />
                        {#if relic.system.infused_dust.value >= relic.system.infused_dust.max}
                            <button transition:blur on:click={() => upgradeRelic(relic)}>
                                Upgrade
                            </button>
                        {/if}
                    {/if}
                </div>
                {#each relic.system.ranks.slice(0, relic.system.rank.value) as rank}
                    {@html rank.text}
                {/each}
            </div>
        {/each}
    </div>
    <div class="burdens">
        <h2>Burdens</h2>
        {#each Object.entries($actor.system.burdens) as [key, _clock]}
            <DocClock clock_width="60px" path={`system.burdens.${key}`} />
        {/each}
    </div>
    <div class="ambitions">
        <h2>Ambitions</h2>
        {#each Object.entries($actor.system.ambitions) as [key, _clock]}
            <DocClock clock_width="60px" path={`system.ambitions.${key}`} />
        {/each}
    </div>
</section>

<style lang="scss">
    section {
        padding: 5px 5px 0px 5px;
        flex: 1 0 auto;

        max-height: calc(100% - 126px);
        display: grid;
        grid-template:
            "xp relics burdens" 1fr
            "xp relics ambitions" 1fr / 1fr 1fr 1fr;

        height: 100%;

        h2 {
            text-align: center;
        }

        > div {
            padding: 0px 3px;
        }

        .xp {
            border-right: var(--primary-border);
            grid-area: xp;

            .opportunity {
                display: flex;
                align-items: center;
                border-bottom: var(--primary-border);
                padding: 5px 0px;

                span {
                    margin-left: 5px;
                }
            }
        }
        .relics {
            border-right: var(--primary-border);
            grid-area: relics;
        }
        .burdens {
            grid-area: burdens;
            border-bottom: var(--primary-border);
        }
        .ambitions {
            grid-area: ambitions;
        }
    }
</style>
