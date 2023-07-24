<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->
<svelte:options accessors={true} />

<script>
    import { ApplicationShell } from "#runtime/svelte/component/core";
    import { scale } from "svelte/transition";
    import { localize } from "../../util/misc";

    export let elementRoot;

    // Props
    export let initial_dice = 1;
    export let initial_purpose = "";

    // Helper consts
    const EFFECTS = ["None", "Limited", "Standard", "Great", "Super"];
    const POSITIONS = ["Desperate", "Risky", "Controlled"];

    // State
    let purpose = initial_purpose;
    let dice = initial_dice;
    let effect = EFFECTS[2];
    let position = POSITIONS[1];

    // Helper functions
    function formula() {
        if (dice <= 0) {
            return "2d6kl1";
        } else {
            return `${dice}d6kh1`;
        }
    }

    // Handlers
    async function doRoll(position, effect, subtype) {
        let roll = new Roll(formula());
        await roll.roll();
        await ChatMessage.create({
            [`flags.${game.system.id}.data`]: {
                type: "narrative",
                subtype,
                position,
                effect,
                purpose,
                actor_uuid: "",
                roll_data: roll.toJSON(),
            },
        });
    }
</script>

<!-- ApplicationShell provides the popOut / application shell frame, header bar, content areas -->
<!-- ApplicationShell exports `elementRoot` which is the outer application shell element -->
<ApplicationShell bind:elementRoot transition={scale} transitionOptions={{ duration: 200 }}>
    <main>
        <h3>{localize("ICON.Rolls.Narrative.Purpose")}:</h3>
        <div class="purposebox">
            <input type="text" bind:value={purpose} />
        </div>
        <h3>{localize("ICON.Rolls.Narrative.NumDice")}:</h3>
        <div class="dicebox">
            {#each [0, 1, 2, 3, 4, 5, 6] as count}
                <button
                    class="dice"
                    class:selected={count == dice}
                    class:zero={count == 0}
                    on:click={() => (dice = count)}
                >
                    {count}
                </button>
            {/each}
            <button class="roll" on:click={() => doRoll(null, null, "Fortune")}>
                {localize("ICON.Rolls.Narrative.Fortune")}
            </button>
        </div>
        <h3>{localize("ICON.Rolls.Narrative.PosEffect")}:</h3>
        <div class="rollbox">
            <div class="flexcol choices">
                {#each POSITIONS as p}
                    <button on:click={() => (position = p)} class:selected={position == p}>
                        {localize(`ICON.Position.${p}`)}
                    </button>
                {/each}
            </div>
            <div class="flexcol choices">
                {#each EFFECTS as e}
                    <button on:click={() => (effect = e)} class:selected={effect == e}>
                        {localize(`ICON.Effect.${e}`)}
                    </button>
                {/each}
            </div>
            <button class="roll" on:click={() => doRoll(position, effect, "Action")}>
                {localize("ICON.Rolls.Narrative.Action")}
            </button>
        </div>
    </main>
</ApplicationShell>

<style lang="scss">
    main {
        display: flex;
        flex-direction: column;
    }

    .roll {
        width: 120px;
        background-color: lightblue;
    }

    .dicebox {
        display: flex;
        flex-direction: row;

        .dice {
            transition: filter 0.1s;
            border-radius: 4px;
            width: 30px;
            height: 30px;
            border: none;
            text-align: center;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            font-size: large;
            margin: 5px;

            // Unselected style
            font-weight: normal;
            opacity: 40%;
            background-color: black;
            color: white;

            &.selected {
                opacity: 100%;
                font-weight: bolder;
            }
        }
    }

    .rollbox {
        display: grid;
        grid-template: repeat(1, 1fr) / repeat(3, 1fr);
        align-items: center;
        justify-items: center;

        .choices button {
            opacity: 40%;
            background-color: black;
            color: white;
            margin: 2px;
            width: 100%;
            cursor: pointer;
            padding: 0px;

            &.selected {
                opacity: 100%;
            }
        }
    }
</style>
