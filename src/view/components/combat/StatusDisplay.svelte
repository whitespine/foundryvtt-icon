<script>
    import { getContext } from "svelte";

    let actor = getContext("tjs_actor");

    function saveAgainst(effect) {
        console.log("Save");
    }

    function saveAgainstAll(effect) {
        console.log("SaveAll");
    }
</script>

<div class="statuses">
    <h3>Statuses</h3>
  
</div>

<style lang="scss">
</style>
