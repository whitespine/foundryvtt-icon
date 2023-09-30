<svelte:options accessors={true} />

<script>
    import { DRAGGING } from "../../../util/stores/dragdrop";
</script>

<div class="window-app" class:faded={false}>
    <slot />
</div>

<style>
    div {
        position: absolute;
        display: flex;
        align-items: flex-end;
        background-color: transparent;
        border: none;
        box-shadow: none;
        flex-direction: row-reverse;
        transition: right 600ms, opacity 200ms;
        z-index: 999;

        bottom: var(--bottom, unset);
        left: var(--left, unset);
        right: var(--right, unset);
        top: var(--top, unset);
    }

    div > slot {
        padding-right: 12px;
        pointer-events: initial;
        flex: unset;
        filter: drop-shadow(0.4rem 0.4rem 0.6rem #333);
    }

    div.faded {
        opacity: 0.2;
        pointer-events: unset;
        
    }
</style>
