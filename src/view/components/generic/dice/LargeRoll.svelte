<script>
    /** @type {Roll} Roll to render */
    export let roll;
</script>

<div>
    {#await roll.render()}
        roll.total
    {:then tooltip}
        {@html tooltip}
    {:catch error}
        {error}
    {/await}
</div>
