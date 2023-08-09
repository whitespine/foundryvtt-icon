<script>
    import { createEventDispatcher } from "svelte";

    /** @type {number} Number of segments */
    export let size;

    /** @type {number} Number of filled segments */
    export let value;

    /** @type {number} Number of alternately filled segments. Prioritized over normally filled segments */
    export let alt_value;

    // Generate our segments automagically 
    let segments;
    $: {
        segments = [];
        for(let i=1; i <= size; i++) {
            segments.push({
                filled: alt_value < i && i <= value,
                alt_filled: i <= alt_value
            })
        }
    }

    // Dispatches 'change'
	const dispatch = createEventDispatcher();
</script>

<div>
    {#each segments as seg, i}
        <div class="segment" 
        class:filled={seg.filled} 
        class:alt-filled={seg.alt_filled} 
        on:click={() => dispatch("change", (i+1) === value ? i : i+1)} 
        on:contextmenu={() => dispatch("alt_change", (i+1) === alt_value ? i : i+1)} />
    {/each}
</div>

<style lang="scss">
    div {
        // display: grid;
        // grid-template: 1fr / 1fr;
        // grid-auto-columns: 1fr;
        display: flex;

        .segment {
            clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
            background-color: var(--clock-empty);
            width: 20px;
            height: 20px;
            cursor: pointer;
            margin: 1px;
        }

        .segment.filled {
            background-color: var(--clock-fill);
        }

        .segment.alt-filled {
            background-color: var(--clock-alt-fill);
        }
    }
</style>


