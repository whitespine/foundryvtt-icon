<script>
    import BoundedNumberDisplay from "../generic/BoundedNumberDisplay.svelte";
    import { localize } from "../../../util/misc";

    export let actor;
</script>

<div {...$$restProps}>
    <div class:bloodied={actor.system.bloodied}>
        <BoundedNumberDisplay name={localize("ICON.Health")} path="system.hp" />
    </div>
    <BoundedNumberDisplay name={localize("ICON.Vigor")} path="system.vigor" />
    {#if actor.system.wounds?.max}
        <BoundedNumberDisplay name={localize("ICON.Wounds")} path="system.wounds" />
    {/if}
    <span>Def: {actor.system.class.defense}</span>
    <span>Die: D{actor.system.class.damage_die}</span>
    <span>Fray: {actor.system.class.fray_damage}</span>
    <span>Speed: {actor.system.class.speed}</span>
    <span>Dash: {actor.system.class.dash}</span>
</div>

<style lang="scss">
    div {
        display: flex;
        flex-direction: row;
        align-items: center;

        span {
            padding-right: 3px;
            padding-left: 3px;
            &:not(:last-child) {
                border-right: var(--primary-border);
            }
        }

        .bloodied {
            color: red;
        }
    }
</style>
