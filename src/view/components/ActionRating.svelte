<script>
    import { getContext } from "svelte";
    import { stepwiseResolveDotpath } from "../../util/paths";
    import SegBar from "./SegBar.svelte";

    /** @type {string} Path to the action*/
    export let path;

    let actor = getContext("tjs_actor");

    let srp, name, value;
    $: srp = stepwiseResolveDotpath($actor, path);
    $: name = srp[srp.length - 1].pathlet;
    $: value = srp[srp.length - 1].val;

    function onClick(target_value) {
        let new_value = target_value === value ? value - 1 : target_value;
        console.log(value, target_value, new_value);
        console.log({[path]: new_value});
        $actor.update({[path]: new_value});
    }
</script>

<div>
    <span>{name.toUpperCase()}</span>
    <SegBar value={value} size={4} on:change={(e) => onClick(e.detail)} />
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template: 1fr / 70px 80px;
        align-items: center;
    }
</style>


