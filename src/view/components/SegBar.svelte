<script>
    import { createEventDispatcher, getContext } from "svelte";
    import { resolveDotpath, stepwiseResolveDotpath } from "../../util/paths";
    import { updateDoc } from "../actions/update";

    /** @type {number} Number of segments */
    export let size;

    /** @type {number} Number of filled segments */
    export let value;

    /** @type {width} The CSS width */
    export let width;

    // Generate our segments automagically 
    let segments;
    $: {
        segments = [];
        for(let i=0; i<size; i++) {
            segments.push({
                value: i == value ? value - 1 : i,
                filled: i <= value
            })
        }
    }

    // Dispatches 'change'
	const dispatch = createEventDispatcher();
</script>

<div>
    {#each segments as seg}
        <div class="segment" class:filled={seg.filled} on:click={() => dispatch('change', seg.value)} />
    {/each}
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template: 1fr / 1fr;
        grid-auto-columns: 1fr;

        .segment {
            clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
            background-color: var(--clock-empty);
            border-color: black;
            width: 20px;
            height: 20px;
            cursor: pointer;
        }

        .segment.filled {
            background-color: var(--clock-fill);
        }
    }
</style>


