<script>
    import BoundedNumberDisplay from "../generic/BoundedNumberDisplay.svelte";
    import { localize } from "../../../util/misc";
    import { updateDoc } from "../../actions/update";
    import { getContext } from "svelte";

    let actor = getContext("tjs_actor");
    let max_hp_override = $actor.system.eff_max_hp ? `${$actor.system.eff_max_hp} (${$actor.system.hp.max})` : null;
</script>

<div {...$$restProps}>
    <div class:bloodied={$actor.system.bloodied}>
        <BoundedNumberDisplay name={localize("ICON.Harm.Health")} path="system.hp" max_override={max_hp_override} />
    </div>
    <BoundedNumberDisplay name={localize("ICON.Harm.Vigor")} path="system.vigor" />
    {#if $actor.system.wounds?.max}
        <BoundedNumberDisplay name={localize("ICON.Harm.Wounds")} path="system.wounds" />
    {/if}
    {#if $actor.type === "player"}
        <label for="resolve">{localize("ICON.Resolve")}</label>
        <input name="resolve" type="number" use:updateDoc={{doc: actor, path: "system.resolve"}} />
    {/if}
    <span class="noborder">Def: {$actor.system.class?.defense ?? 0}</span>
    <span>Die: D{$actor.system.class?.damage_die ?? 0}</span>
    <span>Fray: {$actor.system.class?.fray_damage ?? 0}</span>
    <span>Speed: {$actor.system.class?.speed ?? 0}</span>
    <span>Dash: {$actor.system.class?.dash ?? 0}</span>
    {#if $actor.type === "player"}
        <label for="combo" id="combolabel">{localize("ICON.Combo")}</label>
        <input name="combo" type="checkbox" use:updateDoc={{doc: actor, path: "system.combo"}} />
    {/if}
</div>

<style lang="scss">
    div {
        display: flex;
        flex-direction: row;
        align-items: center;

        span, input, label {
            padding-left: 3px;
            &:not(:last-child) {
                padding-right: 3px;
            }
        }
        span:not(.noborder), #combolabel {
            border-left: var(--primary-border);
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
