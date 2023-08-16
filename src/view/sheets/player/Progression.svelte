<script>
    import { getContext } from "svelte";
    import { localize } from "../../../util/misc";
    import DocClock from "../../components/generic/DocClock.svelte";
    import BoundedNumberDisplay from "../../components/generic/BoundedNumberDisplay.svelte";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias

    // Total pending xp
    let total_xp;
    $: {
        let xp = $actor.system.xp_tracker;
        total_xp = xp.ideals.value + xp.challenges.value + xp.ambitions.value + xp.burdens.value;
    }

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
            "system.xp": $actor.system.xp - 15,
            "system.level": $actor.system.level + 1,
        });
    }
    let can_level;
    $: can_level = $actor.system.level < 12 && $actor.system.xp >= 15;
</script>

<section>
    <div class="xp">
        <h2>XP Tracking</h2>
        <BoundedNumberDisplay name={localize("ICON.XP")} path="system.xp" />
        {#each [
            ["ICON.XPTracking.Ideal", "system.xp_tracker.ideals"],
            ["ICON.XPTracking.Challenge", "system.xp_tracker.challenges"],
            ["ICON.XPTracking.Ambition", "system.xp_tracker.ambitions"],
            ["ICON.XPTracking.Burdens", "system.xp_tracker.burdens"],
        ] as [text, path]}
            <div class="opportunity">
                <i class="fas fa-chevron-right" />
                <span>{localize(text)}</span>
                <DocClock clock_width="30px" path={path} title={false} />
            </div>
        {/each}
        <button on:click={commitXP}>End Session - {total_xp} XP</button>
    </div>
    <div class="relics">
        <h2>Relics</h2>
        <BoundedNumberDisplay name={localize("ICON.Dust")} path="system.dust" />
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
        grid-template: 1fr / repeat(4, 1fr);
        height: 100%;

        h2 {
            text-align: center;
        }

        .xp {
            border-right: var(--primary-border);

            .opportunity {
                display: flex;
                align-items: center;
                border-bottom: var(--primary-border);
                padding: 5px 0px;

                span {
                    margin-left: 5px
                }

            }
        }
        .relics {
            border-right: var(--primary-border);
        }
        .burdens {
            border-right: var(--primary-border);
        }
    }
</style>
