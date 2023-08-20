<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->
<svelte:options accessors={true} />

<script>
    import { ApplicationShell } from "#runtime/svelte/component/core";
    import { computeHarm, quickDamage } from "../../util/harm";
    import { SELECTED_TOKENS } from "../../util/stores";
    import HarmControl from "../components/combat/HarmControl.svelte";

    import { slide } from "svelte/transition";

    export let elementRoot;

    /** @type {number} Our editable damage field*/
    let custom = 0;

    function emitHarm(evt) {
        let { type, value } = evt.detail;
        let items = [];
        for(let v of $SELECTED_TOKENS.values()) {
            items.push([v.actor, computeHarm(v.actor, type, value, [])]);
        }
        quickDamage(items);
    }
</script>

<!-- ApplicationShell provides the popOut / application shell frame, header bar, content areas -->
<!-- ApplicationShell exports `elementRoot` which is the outer application shell element -->
<ApplicationShell bind:elementRoot>
    <main>
        <div class="targs">
            <span>Targets:</span>
            {#each $SELECTED_TOKENS as st (st.id)}
                <img transition:slide={{ axis: "x", duration: 200 }} src={st.document.texture?.src} data-tooltip={st.actor.name} />
            {/each}
            {#if $SELECTED_TOKENS.size === 0}
                <span>Select tokens to apply damage to</span>
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
    </main>
</ApplicationShell>

<style lang="scss">
    main {
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
