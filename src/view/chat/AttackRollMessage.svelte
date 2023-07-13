<!-- Super simple Svelte component that takes in a prop and outputs it. -->
<script>
    // import { fly, fade } from "svelte/transition";

    /** @type {ChatMessage} */
    export let message; // Itself

    /** @type {RollResultData} */
    export let rollData;

    /** @type {Actor | null} */
    // $: leader = rollData.actorID ? fromUuidSync(rollData.actorID) : null;
</script>

<div class="icon flexcol">
    
</div>

<style lang="scss">

</style>
