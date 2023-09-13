<script>
    import { getContext } from "svelte";
    import PreviewItem from "../../components/preview/PreviewItem.svelte";
    import { confirmDeleteDocument } from "../../../util/misc";
    import { equipBond, equipJob } from "../../../util/loadout";
    import { updateDoc } from "../../actions/update";
    import AbilityDetail from "../../components/combat/AbilityDetail.svelte";

    let actor = getContext("tjs_actor");

    const name_alphabetical = (a, b) => a.name.localeCompare(b.name);
    const jobs = actor.embedded.create(Item, {
        name: "loadout-jobs",
        filters: [(i) => i.type === "job"],
        sort: name_alphabetical,
    });
    const bonds = actor.embedded.create(Item, {
        name: "loadout-bonds",
        filters: [(i) => i.type === "bond"],
        sort: name_alphabetical,
    });
    const abilities = actor.embedded.create(Item, {
        name: "loadout-abilities",
        filters: [(i) => i.type === "ability" && !i.system.trait],
        sort: name_alphabetical,
    });
    const traits = actor.embedded.create(Item, {
        name: "loadout-traits",
        filters: [(i) => i.type === "ability" && i.system.trait],
        sort: name_alphabetical,
    });
</script>

<section>
    <div class="flexrow">
        <div>
            <h2>Jobs:</h2>
            {#each [...$jobs] as job}
                <PreviewItem uuid={job.uuid} size="medium">
                    <svelte:fragment slot="controls">
                        {#if !job.system.equipped}
                            <i
                                class="fas fa-play fa-lg"
                                on:click|stopPropagation={() => equipJob($actor, job)}
                                data-tooltip="Equip"
                            />
                        {/if}
                        <i class="fas fa-trash fa-lg" on:click|stopPropagation={() => confirmDeleteDocument(job)} />
                    </svelte:fragment>
                    <svelte:fragment slot="content" let:doc={resolved}>
                        {@html resolved.system.description}
                    </svelte:fragment>
                </PreviewItem>
            {/each}
        </div>
        <div>
            <h2>Bonds:</h2>
            {#each [...$bonds] as bond}
                <PreviewItem uuid={bond.uuid} size="medium">
                    <svelte:fragment slot="controls">
                        {#if !bond.system.equipped}
                            <i
                                class="fas fa-play fa-lg"
                                on:click|stopPropagation={() => equipBond($actor, bond)}
                                data-tooltip="Equip"
                            />
                        {/if}
                        <i class="fas fa-trash fa-lg" on:click|stopPropagation={() => confirmDeleteDocument(bond)} />
                    </svelte:fragment>
                    <svelte:fragment slot="content" let:doc={resolved}>
                        {@html resolved.system.description}
                    </svelte:fragment>
                </PreviewItem>
            {/each}
        </div>
    </div>

    <div class="flexrow">
        {#each [["Traits", [...$traits]], ["Abilities", [...$abilities]]] as [title, list]}
            <div>
                <h2>{title}:</h2>
                {#each list as item}
                    <PreviewItem uuid={item.uuid} size="small">
                        <svelte:fragment slot="controls" let:tjs_doc={resolved}>
                            <input
                                type="checkbox"
                                use:updateDoc={{ doc: resolved, path: "system.equipped" }}
                                on:click|stopPropagation
                            />
                            <i class="fas fa-trash" on:click|stopPropagation={() => confirmDeleteDocument(item)} />
                        </svelte:fragment>
                        <svelte:fragment slot="content" let:doc={resolved}>
                            {#each resolved?.system.choices ?? [] as choice}
                                <AbilityDetail {choice} />
                            {/each}
                        </svelte:fragment>
                    </PreviewItem>
                {/each}
            </div>
        {/each}
    </div>
</section>

<style lang="scss">
    input {
        height: 1em;
    }
</style>
