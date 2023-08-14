<!-- This is necessary for Svelte to generate accessors TRL can access for `elementRoot` -->
<svelte:options accessors={true} />

<script>
    import { ApplicationShell } from "#runtime/svelte/component/core";
    import HarmControl from "../components/combat/HarmControl.svelte";

    export let elementRoot;
</script>

<!-- ApplicationShell provides the popOut / application shell frame, header bar, content areas -->
<!-- ApplicationShell exports `elementRoot` which is the outer application shell element -->
<ApplicationShell bind:elementRoot>
    <main>
        <div class="targs" />
        <div class="standard">
            {#each [1, 2, 3, 4, 999, "25%"] as value}
                <HarmControl {value} />
            {/each}
        </div>
        <div class="customs" />
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
    }

    .standard {
        grid-area: std;
        border-right: var(--primary-border);
    }

    .customs {
        grid-area: custom;
    }

    .standard,
    .customs {
        display: flex;
    }
</style>
