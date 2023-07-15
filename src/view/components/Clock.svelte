<script>
    import { createEventDispatcher } from "svelte";

    export let size = 3;
    export let value = 0;
    export let width = "128px";

    // Taken from a medium article https://marian-caikovski.medium.com/drawing-sectors-and-pie-charts-with-svg-paths-b99b5b6bf7bd
    function createSlicePath(radius, startAngle, endAngle, origin) {
        origin ??= {x: 0, y: 0};
        const isCircle = endAngle - startAngle === 360;
        if (isCircle) {
            endAngle--;
        }
        const start = polarToCartesian(origin, radius, startAngle);
        const end = polarToCartesian(origin, radius, endAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
        const d = ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y];
        if (isCircle) {
            d.push("Z");
        } else {
            d.push("L", origin.x, origin.y, "L", start.x, start.y, "Z");
        }
        return d.join(" ");
    }

    // Converts coordinates
    function polarToCartesian(origin, radius, angleInDegrees) {
        let radians = ((angleInDegrees - 90) * Math.PI) / 180;
        return {
            x: Math.round(origin.x + radius * Math.cos(radians)),
            y: Math.round(origin.y + radius * Math.sin(radians)),
        };
    }

    // Make an iterable for our clock size. Reactive to allow resizing (is this necessary?)
    let slices;
    $: {
        slices = [];
        let rot = 360 / size; // Rotation of each slice
        for (let i = 0; i < size; i++) {
            let filled = i < value
            slices.push({
                class:  filled ? "filled" : "unfilled",
                path: createSlicePath(90, rot * i, rot * (i + 1), {x: 100, y: 100}),
                value: (value ==  i + 1) ? i : i + 1
            });
        }
    }

    // Dispatches 'change'
	const dispatch = createEventDispatcher();
</script>

<svg viewbox="0 0 200 200" style="width: {width}; height: {width}" >
    <g class="sectors">
        {#each slices as slice}
            <path d={slice.path} class="{slice.class}" on:click={() => dispatch('change', slice.value)} />
        {/each}
    </g>
</svg>

<style lang="scss">
    path {
        cursor: pointer;
        stroke: #0c1638;
        stroke-width: 5;
    }
    path.filled {
        fill: rgb(164, 135, 6);
    }
    path.unfilled {
        fill: rgb(39, 240, 240);
    }
</style>
