<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import Portrait from "../components/Portrait.svelte";
    import { localize } from "../../util/misc";
    import ProseMirrorEditor from "../components/generic/ProseMirrorEditor.svelte";
    import Tabs from "../components/generic/Tabs.svelte";
    import { TAB_STORES } from "../../util/stores";
    import BoundedNumberDisplay from "../components/generic/BoundedNumberDisplay.svelte";

    let actor = getContext("tjs_actor");
    let item = getContext("tjs_item"); // Alias
    let doc = item;

    const tabs = ["ICON.Relics.Description", "ICON.Relics.Mechanics"].map((s) => ({
        label: localize(s),
        key: s,
    }));
    let selected_tab = TAB_STORES.get($item.uuid, "ICON.Relics.Description");
</script>

<main>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />
        <div style="grid-area: name">
            <label for="name">Name:</label>
            <input name="name" type="text" use:updateDoc={{ doc, path: "name" }} />
        </div>
        <div style="grid-area: tabs">
            <Tabs horizontal={false} {tabs} bind:selected={$selected_tab} />
        </div>
    </header>

    <!-- Sheet Body -->
    <section class="sheet-body">
        <div class="flexcol">
            {#if $selected_tab === "ICON.Relics.Description"}
                <h3>Description:</h3>
                <ProseMirrorEditor doc={$doc} path={"system.description"} />
                <h3>Aspect Quest:</h3>
                <ProseMirrorEditor doc={$doc} path={"system.aspect_quest"} />
                <div class="flexrow">
                    <div>
                        <BoundedNumberDisplay name="Rank" path={"system.rank"} />
                    </div>
                    <div>
                        <BoundedNumberDisplay name="Dust" path={"system.infused_dust"} />
                    </div>
                </div>
            {:else if $selected_tab === "ICON.Relics.Mechanics"}
                {#each ["1", "2", "3", "Aspected"] as rank_name, rank_index}
                    <div class="rank">
                        <h3 style="grid-area: header;">Rank {rank_name}:</h3>
                        <div style="grid-area: body;">
                            <ProseMirrorEditor doc={$doc} path={`system.ranks.${rank_index}.text`} />
                        </div>
                        <span>Attack Invoke:</span>
                        <input
                            type="number"
                            use:updateDoc={{ doc, path: `system.ranks.${rank_index}.attack_invoke` }}
                            placeholder="-1 to disable"
                        />
                        <span>Round Invoke:</span>
                        <input
                            type="number"
                            use:updateDoc={{ doc, path: `system.ranks.${rank_index}.round_invoke` }}
                            placeholder="-1 to disable"
                        />
                        <span>Show Gambit Tracker:</span>
                        <input
                            type="checkbox"
                            use:updateDoc={{ doc, path: `system.ranks.${rank_index}.gambit` }}
                        />
                    </div>
                {/each}
            {:else}
                <span> ERROR {$selected_tab}</span>
            {/if}
        </div>
    </section>
</main>

<style lang="scss">
    main {
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }

    header {
        display: grid;
        grid-template: "pic name tabs" 120px / 120px 1fr 120px;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 140px);
    }

    .rank {
        display: grid;
        align-items: center;
        grid-template:
            "header header header header header header" 1fr
            "body   body   body   body   body   body"   1fr
            "atk_m  atk_f  rnd_m  rnd_f  gmb_m  gmb_f"  1fr / 1fr 1fr 1fr 1fr 1fr 1fr;
    }
</style>
