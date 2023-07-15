<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import { localize } from "../../util/misc";
    import DocClock from "../components/DocClock.svelte";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias
</script>

<main class="flexcol" autocomplete="off">
    <!-- Sheet Header -->
    <header>
        <img class="profile-img" src={$actor.img} data-edit="img" title={$actor.name} height="100" width="100" alt="Character Portrait" />
        <div class="header-fields flex-group-center">
            <h1 class="charname">
                <input type="text" use:updateDoc={{ doc, path: "name" }} />
            </h1>
        </div>
        <div class="narrative-information">
            <span>{localize("ICON.Kintype")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.kintype" }} />
            <span>{localize("ICON.Culture")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.culture" }} />
            <span>{localize("ICON.Bond")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.bond" }} />
        </div>
        <div class="tactical-information">
            <span>{localize("ICON.Class")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.class" }} />
            <span>{localize("ICON.Job")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.job" }} />
            <span>{localize("ICON.Level")}: </span>
            <input type="number" use:updateDoc={{ doc, path: "system.level" }} />
        </div>
        <div class="icon-resource-inputs">
            <div class="icon-resource">
                <label for="actor.health.value" class="resource-label">{localize("ICON.Health")}</label>
                <input type="number" use:updateDoc={{ doc, path: "system.health.value}" }} />
                <span> / </span>
                <input type="number" use:updateDoc={{ doc, path: "system.health.max}" }} />
            </div>
            <!--
            <div class="icon-resource">
				<label for="actor.power.value" class="resource-label">{localize("ICON.JobResource")}</label>
                <input type="number" use:updateDoc={{doc, path: "system.power.value}"}}/>
                <span> / </span>
                <input type="number" use:updateDoc={{doc, path: "ctor.power.max}"}}/>
            </div>-->
            <div class="icon-resource">
                <label for="actor.strain.value" class="resource-label">{localize("ICON.Strain")}</label>
                <input type="number" use:updateDoc={{ doc, path: "system.strain.value}" }} />
                <span> / </span>
                <input type="number" use:updateDoc={{ doc, path: "system.strain.max}" }} />
            </div>
            <div class="icon-resource">
                <label for="actor.effort.value" class="resource-label">{localize("ICON.Effort")}</label>
                <input type="number" use:updateDoc={{ doc, path: "system.effort.value}" }} />
                <span> / </span>
                <input type="number" use:updateDoc={{ doc, path: "system.effort.max}" }} />
            </div>
        </div>
    </header>

    <!-- Sheet Tab Navigation -->
    <nav class="sheet-tabs tabs" actor-group="primary">
        <a class="item" actor-tab="narrative" actor-group="primary">{localize("ICON.Narrative")}</a>
        <a class="item" actor-tab="traits" actor-group="primary">{localize("ICON.Traits-Relics")}</a>
        <a class="item" actor-tab="items" actor-group="primary">{localize("ICON.AbilitiesTrophies")}</a>
        <a class="item" actor-tab="attributes" actor-group="primary">{localize("ICON.Attributes")}</a>
    </nav>

    <!-- Sheet Body -->
    <section class="sheet-body">
        <!-- Narrative Tab -->
        <div class="tab narrative" actor-group="primary" actor-tab="narrative">
            <div class="narrative-grid">
                <section class="skills">
                    {#each Object.entries($actor.system.actions) as [action_name, action_value]}
                        {{ action_name }}
                    {/each}
                </section>
                <section class="XPDust">
                    <div class="XP-and-Dust">
                        <div class="XP-value">
                            <span>{localize("ICON.XP")}</span>
                        </div>
                        <div class="Dust-value">
                            <span>{localize("ICON.Dust")}</span>
                            <label for="attributes-Dust-{this}" />
                        </div>
                    </div>
                </section>
                <section class="burdens">
                    <div class="burden-clocks">
                        <DocClock path="system.burdens.c4" />
                        <DocClock path="system.burdens.c6" />
                        <DocClock path="system.burdens.c8" />
                    </div>
                    <div class="burden-names">
                        <input type="text" use:updateDoc={{ doc, path: "system.burdens.c4.name" }} />
                        <input type="text" use:updateDoc={{ doc, path: "system.burdens.c6.name" }} />
                        <input type="text" use:updateDoc={{ doc, path: "system.burdens.c8.name" }} />
                    </div>
                </section>
                <section class="ambitions">
                    <div class="ambition-clocks">
                        <DocClock path="system.ambitions.c4" />
                        <DocClock path="system.ambitions.c6" />
                        <DocClock path="system.ambitions.c10" />
                    </div>
                    <div class="ambition-names">
                        <input type="text" use:updateDoc={{ doc, path: "system.ambitions.c4.name" }} />
                        <input type="text" use:updateDoc={{ doc, path: "system.ambitions.c6.name" }} />
                        <input type="text" use:updateDoc={{ doc, path: "system.ambitions.c10.name" }} />
                    </div>
                </section>

            </div>
        </div>

        <!-- Traits & Relics Tab -->
        <div class="tab traits" actor-group="primary" actor-tab="traits">
            <div class="traitsrelics">
                <div class="traitheader">
                    <span>Traits</span>
                </div>

                <!-- Abilities & Trophies Tab -->
                <div class="tab items" actor-group="primary" actor-tab="items">
                    <div class="CombatBar">
                        <div class="Personal Resolve">
                            <span>Personal Resolve</span>
                            <span>Wounds</span>
                            <span>Abilities</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>

<style lang="scss">
    main {
        background-color: grey;
    }

    header {
        grid-template:  "a b" 40px 
                        "c d" 40px / 1fr 1fr
    }
</style>
