<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->
<script>
    import { ICON } from "../../../consts";
    import { computeHarm, flagsForAttacker, flagsForDefender, quickDamage } from "../../../util/harm";
    import { actorTokenImage, simpleMixList } from "../../../util/misc";
    import { ATTACKER, SELECTED_TOKENS, TARGETED_TOKENS } from "../../../util/stores/tokens";
    import { DamageRollPromptApplication } from "../../apps/DamageRollPromptApplication";
    import { RapidPromptApplication } from "../../apps/RapidPromptApplication";

    import { slide } from "svelte/transition";

    async function emitHarm(value) {
        let dice_result = `${value}`;
        if(value === "cust.") {
            value = await RapidPromptApplication.show("number");
            if(!value) return;
        } else if (value === "roll") {
            const damageRoll = await DamageRollPromptApplication.show();
            const { total, result } = damageRoll;
            value = total;
            dice_result = result;
            if(!value) return;
        }

        let items = [];
        for (let target of $TARGETED_TOKENS.values()) {
            if (target.actor) {
                let flags = flagsForDefender(target.actor);
                if ($ATTACKER?.actor) {
                    flags.push(...flagsForAttacker($ATTACKER?.actor));
                }
                
                items.push([target.actor, computeHarm(target.actor, selected_type, value, dice_result, flags)]);
            }
        }
        if (items.length) {
            quickDamage(items);
        }
    }
    
    // Are they dragging an attacker?
    let dragged = null;

    // Are they hoving over the "roll" damage button?
    // This one specifically only applies to the first target
    let hovering_roll = false;

    // For reordering targets
    function dropHandler(evt) {
        let token = evt.target.dataset.id ? game.canvas.scene.tokens.get(evt.target.dataset.id) : null;
        let remixed = simpleMixList($TARGETED_TOKENS, dragged, token?._object, true);
        $TARGETED_TOKENS = remixed;
    }    
    
    // For removing targets
    function clearHandler(evt) {
        let token = evt.target.dataset.id ? game.canvas.scene.tokens.get(evt.target.dataset.id) : null;
        let remixed = $TARGETED_TOKENS.filter(t => t != token?._object);
        $TARGETED_TOKENS = remixed;
    }
    
    // Current selected damage type
    let selected_type = "damage";
</script>

<div class="main">
    <div class="targs" on:drop={dropHandler}>
        <img src={actorTokenImage($ATTACKER, "icons/logo-scifi.png")} alt={$ATTACKER?.name} data-tooltip="Select damage source token"/>
        <span><i class="fas fa-arrow-right" /></span>
        {#if $TARGETED_TOKENS.length === 0}
            <span>Target tokens to apply damage to them!</span>
        {/if}
        {#each $TARGETED_TOKENS as st, index (st.id)}
            <img
                alt={st.name}
                transition:slide={{ axis: "x", duration: 200 }}
                src={st.document.texture?.src}
                data-tooltip={st.name}
                draggable="true"
                data-id={st.id}
                class:glow={index===0 && hovering_roll}
                on:drag={() => dragged = st}
                on:contextmenu|preventDefault={clearHandler}
            />
        {/each}
    </div>
    <div class="type">
        {#each ["damage", "piercing", "divine", "vigor"] as type}
            <button on:click|stopPropagation|preventDefault={() => selected_type = type} class:selected={type === selected_type}>
                <i class={ICON.css[type]} />
                <span>{type}</span>
            </button>
        {/each}
    </div>
    <div class="standard">
        {#each [1, 2, 3, 4, 999, "25%", "roll", "cust."] as value}
            <button on:click={() => emitHarm(value)} on:mouseenter={() => {
                if(value === "roll") hovering_roll = true;
            }} on:mouseleave={() => {
                if(value === "roll") hovering_roll = false;
            }}>
                {value}{#if $ATTACKER?.actor?.system.class?.fray_damage === value}|fray{/if}
            </button>
        {/each}
    </div>
</div>

<style lang="scss">
    .main {
        display: grid;
        grid-template:
            "targs targs" 1fr
            "type  std " 64px / 200px 1fr;
    }

    .targs {
        grid-area: targs;
        border-bottom: var(--primary-border);
        display: flex;
        flex-direction: row;
        flex-wrap: wrap-reverse;
        align-items: center;

        img {
            width: 56px;
            width: 56px;
            margin: 4px;
        }

        span {
            padding-right: 4px;
        }

        .glow {
            box-shadow: 0px 0px 3px 3px green;
        }
    }

    .type {
        grid-area: type;

        display: grid;
        grid-template: 1fr 1fr / 1fr 1fr;

        button {
            background-color: var(--tab-inactive-background);
            color: var(--tab-inactive-text);
        }

        button.selected {
            background-color: var(--tab-active-background);
            color: var(--tab-active-text);
        }

    }

    .standard {
        grid-area: std;

        display: grid;
        grid-template: repeat(2, 1fr) / repeat(4, 1fr);

        button {
            background-color: var(--primary-background);
            color: var(--primary-color);

            transition: background-color 200ms;

            &:hover {
                background-color: var(--tertiary-background);
                color: var(--tertiary-color);
            }
        }
    }
</style>
