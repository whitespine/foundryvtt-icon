<script>
    export let clock = {
        size: 4,
        value: 0,
    };
    export let size = "128px";

    // Taken from a medium article https://marian-caikovski.medium.com/drawing-sectors-and-pie-charts-with-svg-paths-b99b5b6bf7bd
    function createSlicePath(radius, startAngle, endAngle) {
        const isCircle = endAngle - startAngle === 360;
        if (isCircle) {
            endAngle--;
        }
        const start = polarToCartesian(radius, startAngle);
        const end = polarToCartesian(radius, endAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
        const d = ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y];
        if (isCircle) {
            d.push("Z");
        } else {
            d.push("L", radius, radius, "L", start.x, start.y, "Z");
        }
        return d.join(" ");
    }

    // Converts coordinates
    function polarToCartesian(radius, angleInDegrees) {
        var radians = ((angleInDegrees - 90) * Math.PI) / 180;
        return {
            x: Math.round(radius + radius * Math.cos(radians)),
            y: Math.round(radius + radius * Math.sin(radians)),
        };
    }

    // Make an iterable for our clock size
    let slices;
    $: {
        console.log(clock.value);
        slices = [];
        let rot = 360 / clock.size; // Rotation of each slice
        for (let i = 0; i < clock.size; i++) {
            let filled = i < clock.value
            slices.push({
                class:  filled ? "filled" : "unfilled",
                path: createSlicePath(100, rot * i, rot * (i + 1)),
                value: filled ? i : i + 1
            });
        }
    }

    function setClock(new_value) {
        clock.value = new_value;
    }
</script>

<svg viewbox="0 0 200 200" style="width: {size}; height: {size}">
    <g class="sectors">
        {#each slices as slice}
            <path d={slice.path} class="{slice.class}" on:click={() => setClock(slice.value)} />
        {/each}
    </g>
</svg>

<style lang="scss">
    path {
        cursor: pointer;
        stroke: white;
        stroke-width: 5;
    }
    path.filled {
        fill: green;
    }
    path.unfilled {
        fill: red;
    }
</style>
