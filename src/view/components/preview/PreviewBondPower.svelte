<script>
    /** @type {TJSDocument<IconItem>}*/
    export let power;
</script>

<div>
    <span>{power.name}</span> 
    <p>{power.description}</p>
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template: 30px 1fr / 1fr;
    }
</style>
