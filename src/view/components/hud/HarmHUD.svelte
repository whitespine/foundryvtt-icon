<script>
    import HudZone from "./HudZone.svelte";
    import { SIDEBAR_LEFT } from "../../../util/stores/foundryui";
    import HarmApplicator from "../../apps/HarmApplicator.svelte";
    import { SHOW_HARM_HUD } from "./hud";
    import { fade, slide } from "svelte/transition";

    let tocker = false;
    setInterval(() => (tocker = !tocker), 500);
</script>

<HudZone --bottom={"0px"} --left={`${$SIDEBAR_LEFT - 550}px`}>
    {#if $SHOW_HARM_HUD}
        <div class="root" transition:slide>
            <HarmApplicator />
        </div>
    {/if}
</HudZone>

<style lang="scss">
    .root {
        background-color: var(--primary-background);
        color: var(--primary-color);
        width: 520px;
        height: 130px;
        border-top: solid var(--primary-color) 2px;
        border-left: solid var(--primary-color) 2px;
        border-right: solid var(--primary-color) 2px;
    }
</style>
