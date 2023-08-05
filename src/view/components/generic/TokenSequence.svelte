<script>
    import { getContext } from "svelte";
    import { Token } from "../../../util/nlp";
    import TokenRenderer from "./TokenRenderer.svelte";

    /** @type {Token[]} Our token sequence to render */
    export let tokens;

    /** Used for saving changes to tokens */
    export let unique_id = null;

    function addSibling(evt, i) {
        tokens = [...tokens.slice(0, i + 1), new Token(evt.detail), ...tokens.slice(i + 2)];
    }

    /**
     * If in a message & have a unique id, persists data changes to the DB
     * @param evt Event to handle
     */
    function saveMessageTokens(evt) {
        if(!unique_id) console.log("Not persisting change to ");
        let msg = getContext("message");
        if(!msg) console.log("Not persisting change to messageless TokenSequence")

        msg.update({[`flags.${game.system.id}.data.tokens.${unique_id}`]: evt.detail})
    }
</script>

<div>
    {#each tokens as token, i}
        <TokenRenderer {token} on:addSibling={(evt) => addSibling(evt, i)} on:saveMessageTokens={saveMessageTokens}/>
    {/each}
</div>

<style lang="scss">
    div {
        display: flex;
        flex-direction: row;
    }
</style>
