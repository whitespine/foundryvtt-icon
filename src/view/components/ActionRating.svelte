<script>
    import { getContext } from "svelte";
    import { stepwiseResolveDotpath } from "../../util/paths";
    import SegBar from "./generic/SegBar.svelte";
    import ForgedRollApplication from "../apps/FitdRollDialog";

    /** @type {string} Path to the action*/
    export let path;

    let actor = getContext("tjs_actor");

    let srp, name, value;
    $: srp = stepwiseResolveDotpath($actor, path);
    $: name = srp[srp.length - 1].pathlet;
    $: value = srp[srp.length - 1].val;

    function setValue(target_value) {
        let new_value = target_value === value ? value - 1 : target_value;
        $actor.update({[path]: new_value});
    }

    function promptRoll() {
        let rect = this.parentElement.getBoundingClientRect();
        ForgedRollApplication.show({
            x: rect.right, 
            y: rect.top, 
            initial_purpose: `${name} roll`,
            initial_dice: value,
        });
    }
</script>

<div>
    <span on:click={promptRoll}>{name.toUpperCase()}</span>
    <SegBar value={value} size={4} on:change={(e) => setValue(e.detail)} />
</div>

<style lang="scss">
    span {
        cursor: pointer;
    }
    div {
        display: grid;
        grid-template: 1fr / 70px 80px;
        align-items: center;
    }
</style>


