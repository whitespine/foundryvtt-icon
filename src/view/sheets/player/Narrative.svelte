<script>
    import { getContext } from "svelte";
    import { localize } from "../../../util/misc";
    import BoundedNumberDisplay from "../../components/generic/BoundedNumberDisplay.svelte";
    import ActionRating from "../../components/ActionRating.svelte";
    import { dragAsDoc } from "../../actions/drag";
    import BondPowerDisplay from "../../components/narrative/BondPowerDisplay.svelte";

    let actor = getContext("tjs_actor");

    // Initialize our embedded categories
    const sort = (a, b) => a.sort - b.sort;
    const bond_powers = actor.embedded.create(Item, {
        name: "bond-powers",
        filters: [(i) => i.type === "bond-power"],
        sort,
    });

    /**
     * Open the current bond for editing
     */
    function editBond() {
        $actor.system.bond.sheet.render(true, { focus: true });
    }
</script>

<section>
    <!-- Narrative Tab -->
    <div class="leftcol">
        <div class="actions">
            {#each Object.keys($actor.system.actions) as action_name}
                <ActionRating path={`system.actions.${action_name}`} />
            {/each}
        </div>
        <div class="flexrow">
            <BoundedNumberDisplay name={localize("ICON.Strain")} path="system.strain" />
            <BoundedNumberDisplay name={localize("ICON.Effort")} path="system.effort" />
        </div>
    </div>
    <div class="midcol">
        {#each [...$bond_powers] as bp (bp.id)}
            <BondPowerDisplay power={bp} />
        {/each}
    </div>
    <div class="rightcol">
        <div class="bond">
            {#if $actor.system.bond}
                <h2
                    style="text-align: center;"
                    data-tooltip={$actor.system.bond.system.description}
                    use:dragAsDoc={{ doc: $actor.system.bond }}
                    draggable="true"
                >
                    {$actor.system.bond.name}
                    <i class="fas fa-edit fa-xs" on:click={editBond} />
                </h2>

                <span>
                    <strong>{localize("ICON.Bonds.SecondWind")}</strong>
                    {@html $actor.system.bond.system.second_wind}
                </span>
                <span>
                    <strong>{localize("ICON.Bonds.SpecialAbility")}:</strong>
                    {@html $actor.system.bond.system.special_ability}
                </span>
                <span><strong>{localize("ICON.Bonds.Ideals")}:</strong></span>
                <ul>
                    {#each $actor.system.bond.system.ideals as ideal}
                        <li>{ideal}</li>
                    {/each}
                </ul>
            {:else}
                <h2>No Bond</h2>
                <p>{localize("ICON.Tutorial.AddBond")}</p>
            {/if}
        </div>
    </div>
</section>

<style lang="scss">
    section {
        padding: 5px 5px 0px 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 125px);

        display: grid;
        grid-template: 1fr / 220px 1fr 220px;
        height: 100%;

        .leftcol,
        .midcol {
            border-right: var(--primary-border);
            padding-right: 10px;
        }
        .midcol,
        .rightcol {
            padding-left: 10px;
        }

        .actions {
            grid-area: actions;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-bottom: var(--primary-border);
            padding-bottom: 10px;
        }

        .bond {
            display: flex;
            flex-direction: column;
        }
    }
</style>
