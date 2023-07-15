<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import { localize } from "../../util/misc";
    import DocClock from "../components/DocClock.svelte";
    import BoundedNumberDisplay from "../components/BoundedNumberDisplay.svelte";
    import Clock from "../components/Clock.svelte";

    let actor = getContext("tjs_actor");
    let doc = actor; // Alias
</script>

<main class="flexcol" autocomplete="off">
    <!-- Sheet Header -->
    <header>
        <img style="grid-area: pic" src={$actor.img} data-edit="img" title={$actor.name} height="100" width="100" alt="Character Portrait" />
        <input style="grid-area: char_name" type="text" use:updateDoc={{ doc, path: "name" }} />
        <input style="grid-area: player_name" type="text" use:updateDoc={{ doc, path: "system.player_name" }} />
        <div style="grid-area: narr" class="header-information">
            <span>{localize("ICON.Kintype")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.kintype" }} />
            <span>{localize("ICON.Culture")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.culture" }} />
            <span>{localize("ICON.Bond")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.bond" }} />
        </div>
        <div style="grid-area: comb" class="header-information">
            <span>{localize("ICON.Class")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.class" }} />
            <span>{localize("ICON.Job")}: </span>
            <input type="text" use:updateDoc={{ doc, path: "system.job" }} />
            <span>{localize("ICON.Level")}: </span>
            <input type="number" use:updateDoc={{ doc, path: "system.level" }} />
        </div>
        <div style="grid-area: stats" class="flexrow">
            <BoundedNumberDisplay name={localize("ICON.Effort")} path="system.effort" />
            <BoundedNumberDisplay name={localize("ICON.Health")} path="system.hp" />
            <BoundedNumberDisplay name={localize("ICON.Health")} path="system.hp" />
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
                    {#each Object.entries($actor.system.burdens) as [key, _clock]}
                        <DocClock path={`system.burdens.${key}`} />
                    {/each}
                </section>
                <section class="ambitions">
                    {#each Object.entries($actor.system.ambitions) as [key, _clock]}
                        <DocClock path={`system.ambitions.${key}`} />
                    {/each}
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
        display: grid;
        grid-template:  "pic    char_name   player_name"    30px 
                        "pic    narr        comb"           80px 
                        "pic    stats       stats"          1fr / 100px 1fr 1fr;
        
        .header-information {
            display: grid;
            grid-template: 1fr 1fr 1fr / 1fr 1fr;
        }
    }

</style>
