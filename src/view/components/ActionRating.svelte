<script>
    import { getContext } from "svelte";
    import { resolveDotpath, stepwiseResolveDotpath } from "../../util/paths";
    import SegBar from "./generic/SegBar.svelte";
    import ForgedRollApplication from "../apps/FitdRollDialog";

    /** @type {string} Path to the action*/
    export let path;

    let actor = getContext("tjs_actor");

    // Resolve our value path
    let srp, name, value;
    $: srp = stepwiseResolveDotpath($actor, path);
    $: name = srp[srp.length - 1].pathlet;
    $: value = srp[srp.length - 1].val;

    // And our burden penalty path!
    let penalty_path = path;
    $: penalty_path = path.replace(".actions.", ".action_penalties.");
    $: penalty_value = resolveDotpath($actor, penalty_path);

    /**
     * Set a new action rating
     * @param {number} target_value The new value
     */
    function setValue(target_value) {
        let new_value = target_value === value ? value - 1 : target_value;
        let new_penalty = Math.min(penalty_value, new_value); // Reduce penalty to equal value
        $actor.update({
            [path]: new_value,
            [penalty_path]: new_penalty,
        });
    }

    /**
     * Set a new action penalty
     * @param {number} target_value The new penalty
     */
    function setPenalty(target_value) {
        let new_penalty = target_value === penalty_value ? penalty_value - 1 : target_value;
        new_penalty = Math.min(new_penalty, value);
        $actor.update({
            [penalty_path]: new_penalty,
        });
    }

    function promptRoll() {
        let rect = this.parentElement.getBoundingClientRect();
        ForgedRollApplication.show({
            x: rect.right,
            y: rect.top,
            initial_purpose: `${name} roll`,
            initial_dice: value - penalty_value,
        });
    }
</script>

<div>
    <span on:click={promptRoll}>{name.toUpperCase()}</span>
    <SegBar
        {value}
        alt_value={penalty_value}
        size={4}
        on:change={(e) => setValue(e.detail)}
        on:alt_change={(e) => setPenalty(e.detail)}
    />
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
