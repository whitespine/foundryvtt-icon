<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->
<script>
    import { computeHarm, flagsForAttacker, flagsForDefender, quickDamage } from "../../util/harm";
    import { ATTACKER, SELECTED_TOKENS, TARGETED_TOKENS } from "../../util/stores/tokens";
    import { actorTokenImage, simpleMixList } from "../actions/util";
    import HarmControl from "../components/combat/HarmControl.svelte";

    import { slide } from "svelte/transition";

    /** @type {number} Our editable damage field*/
    let custom = 0;

    function emitHarm(evt) {
        let { type, value } = evt.detail;
        let items = [];
        for (let target of $TARGETED_TOKENS.values()) {
            if (target.actor) {
                let flags = flagsForDefender(target.actor);
                if ($ATTACKER?.actor) {
                    flags.push(...flagsForAttacker($ATTACKER?.actor));
                }
                items.push([target.actor, computeHarm(target.actor, type, value, flags)]);
            }
        }
        if (items.length) {
            quickDamage(items);
        }
    }
    
    let dragged = null;

    function dropHandler(evt) {
        let token = evt.target.dataset.id ? game.canvas.scene.tokens.get(evt.target.dataset.id) : null;
        let remixed = simpleMixList($TARGETED_TOKENS, dragged, token?._object, true);
        $TARGETED_TOKENS = remixed;
    }
</script>

<div class="main">
    <div class="targs" on:drop={dropHandler}>
        <span>Origin:</span>
        <img src={actorTokenImage($ATTACKER, "icons/logo-scifi.png")} alt={$ATTACKER?.name}/>
        <span>Targets:</span>
        {#each $TARGETED_TOKENS as st (st.id)}
            <img
                alt={st.name}
                transition:slide={{ axis: "x", duration: 200 }}
                src={st.document.texture?.src}
                data-tooltip={st.name}
                draggable="true"
                data-id={st.id}
                on:drag={() => dragged = st}
            />
        {/each}
        {#if $TARGETED_TOKENS.size === 0}
            <span>Target tokens to apply damage to</span>
        {/if}
    </div>
    <div class="standard">
        {#each [1, 2, 3, 4, 999, "25%", custom] as value}
            <HarmControl {value} on:harm={emitHarm} />
        {/each}
    </div>
    <div class="customs" data-tooltip="Custom damage">
        <input type="number" bind:value={custom} />
    </div>
</div>

<style lang="scss">
    .main {
        display: grid;
        grid-template:
            "targs targs" 64px
            "std  custom" 64px / 1fr 1fr;
    }

    .targs {
        grid-area: targs;
        border-bottom: var(--primary-border);
        display: flex;
        flex-direction: row;
        align-items: center;

        img {
            width: 56px;
            width: 56px;
            margin: 4px;
        }

        span {
            padding-right: 4px;
        }
    }

    .standard {
        grid-area: std;
        border-right: var(--primary-border);
    }

    .customs {
        grid-area: custom;
        input {
            height: 100%;
            border-radius: 50%;
            text-align: center;
            font-size: 30px;
        }
    }

    .standard,
    .customs {
        display: flex;
    }
</style>
