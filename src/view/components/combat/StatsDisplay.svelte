<script>
    import BoundedNumberDisplay from "../generic/BoundedNumberDisplay.svelte";
    import { localize } from "../../../util/misc";
    import { updateDoc } from "../../actions/update";
    import { getContext } from "svelte";

    let actor = getContext("tjs_actor");
</script>

<div {...$$restProps}>
    <div class:bloodied={$actor.system.bloodied}>
        <BoundedNumberDisplay name={localize("ICON.Health")} path="system.hp" />
    </div>
    <BoundedNumberDisplay name={localize("ICON.Vigor")} path="system.vigor" />
    {#if $actor.system.wounds?.max}
        <BoundedNumberDisplay name={localize("ICON.Wounds")} path="system.wounds" />
    {/if}
    {#if $actor.type === "player"}
        <label for="aether">{localize("ICON.Aether")}</label>
        <input name="aether" type="number" use:updateDoc={{doc: actor, path: "system.aether"}} />
    {/if}
    <span>Def: {$actor.system.class?.defense ?? 0}</span>
    <span>Die: D{$actor.system.class?.damage_die ?? 0}</span>
    <span>Fray: {$actor.system.class?.fray_damage ?? 0}</span>
    <span>Speed: {$actor.system.class?.speed ?? 0}</span>
    <span>Dash: {$actor.system.class?.dash ?? 0}</span>
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

        input {
            width: 24px;
            text-align: center;
        }
    }
</style>
