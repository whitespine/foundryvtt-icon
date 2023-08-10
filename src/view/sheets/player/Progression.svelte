<script>
    import { tooltip } from "@svelte-plugins/tooltips";
    import { getContext } from "svelte";
    import { localize } from "../../../util/misc";
    import DocClock from "../../components/generic/DocClock.svelte";
    import BoundedNumberDisplay from "../../components/generic/BoundedNumberDisplay.svelte";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias
</script>

<section>
    <div class="xp">
        <h2>XP Tracking</h2>
        <BoundedNumberDisplay name={localize("ICON.XP")} path="system.xp" />
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
        }
        .relics {
            border-right: var(--primary-border);
        }
        .burdens {
            border-right: var(--primary-border);
        }
        .ambitions {
        }
    }
</style>
