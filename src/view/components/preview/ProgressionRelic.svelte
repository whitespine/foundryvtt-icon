<script>
    import { localize } from "../../../util/misc";
    import BoundedNumberDisplay from "../../components/generic/BoundedNumberDisplay.svelte";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";
    import { blur, slide } from "svelte/transition";
    import RichTextDisplay from "../../components/generic/RichTextDisplay.svelte";

    export let relic;

    // Upgrade the specified relic
    function upgradeRelic() {
        relic.update({
            "system.rank": relic.system.rank.value + 1,
            "system.infused_dust": relic.system.infused_dust.value - relic.system.infused_dust.max,
        });
    }

    let expanded = false;
</script>

<div class="relic clickable" on:click={() => (expanded = !expanded)}>
    <img src={relic.img} style="grid-area: img" />
    <h3 style="grid-area: title;">
        {relic.name}
        {#if relic.system.rank.value === 4}
            A.
        {:else}
            {relic.system.rank.value}
        {/if}
        <i
            class="fas fa-edit clickable"
            on:click|stopPropagation={() => relic.sheet.render(true, { focus: true })}
            style="float: right"
        />
    </h3>
    {#if relic.system.rank.value < 4 && relic.system.infused_dust.value >= relic.system.infused_dust.max}
        <div class="upgr">
            <button transition:blur on:click|stopPropagation={upgradeRelic}>
                {localize(relic.system.rank.value < 3 ? "ICON.Upgrade" : "ICON.Aspect")}
            </button>
        </div>
    {/if}
    <div class="dust">
        {#if relic.system.rank.value < 4}
            <BoundedNumberDisplay
                name={localize("ICON.Infused")}
                doc={new TJSDocument(relic)}
                path="system.infused_dust"
            />
        {:else}
            <span>ASPECTED</span>
        {/if}
    </div>
    <div class="desc">
        {#if expanded}
            <div transition:slide>
                <RichTextDisplay body={relic.system.description} />
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .relic {
        border: var(--primary-border);
        border-radius: 5px;
        padding: 4px;

        display: grid;
        grid-template:
            "img title" 32px
            "img dust" 32px
            "upgr desc" 1fr / 64px 1fr;

        img {
            grid-area: img;
        }

        h3 {
            grid-area: title;
        }

        .dust {
            grid-area: dust;
        }

        .upgr {
            grid-area: upgr;
        }

        .desc {
            grid-area: desc;
        }
    }
</style>
