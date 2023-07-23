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

    // State
    let purpose = initial_purpose;
    let dice = initial_dice;

    // Helper consts
    const EFFECTS = ["None", "Limited", "Standard", "Great", "Super"];
    const POSITIONS = ["Controlled", "Risky", "Desperate"];

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
            <button class="fortune" on:click={() => doRoll(null, null, "Fortune")}
                >{localize("ICON.Rolls.Narrative.Fortune")}</button
            >
        </div>
        <h3>{localize("ICON.Rolls.Narrative.PosEffect")}:</h3>
        <div class="rollbox">
            <div class="dark" />
            {#each EFFECTS as effect}
                <span class="dark">{localize(`ICON.Effect.${effect}`)}</span>
            {/each}
            {#each POSITIONS as position}
                <span class="dark">{localize(`ICON.Position.${position}`)}</span>
                {#each EFFECTS as effect}
                    <button type="button" on:click={() => doRoll(position, effect, "Action")}>🎲</button>
                {/each}
            {/each}
        </div>
    </main>
</ApplicationShell>

<style lang="scss">
    main {
        display: flex;
        flex-direction: column;
    }

    .dicebox {
        display: flex;
        flex-direction: row;

        .fortune {
            width: 100px;
            background-color: lightblue;
        }

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
        grid-template: repeat(3, 1fr) / repeat(6, 1fr);
        align-items: center;
        justify-items: center;

        .dark {
            color: black;
        }

        button {
            background-color: grey;
            border-radius: 100%;
            opacity: 20%;
            width: 25px;
            height: 25px;
            line-height: 25px;
            cursor: pointer;
            outline: none;
            box-shadow: none;
            border: none;
            padding: 0px;

            &:hover {
                opacity: 100%;
            }
        }
    }
</style>
