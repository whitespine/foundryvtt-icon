<script>
    import { getContext } from "svelte";
    import { Token } from "../../../util/nlp";
    import TokenRenderer from "./TokenRenderer.svelte";

    /** @type {Token[]} Parses out to our token sequence to render*/
    export let tokens;

    $: console.log(tokens);

    /** Used for saving changes to tokens */
    export let unique_id = null;

    /** Likewise */
    let msg = getContext("message");

    function addSibling(evt, i) {
        console.log("c", i);
        tokens = [...tokens.slice(0, i + 1), new Token(evt.detail), ...tokens.slice(i + 1)];
        console.log(tokens);
    }


    /**
     * If in a message & have a unique id, persists data changes to the DB
     * @param evt Event to handle
     */
    function saveMessageTokens() {
        if (!unique_id) console.log("Not persisting change to unique idless TokenSequence");
        if (!msg) console.log("Not persisting change to messageless TokenSequence");

        console.log("Updating message");
        let token_data = tokens.map(t => t.toObject());
        msg.update({ [`flags.${game.system.id}.data.tokens.${unique_id}`]: token_data });
    }
</script>

<div>
    {#if tokens?.length}
        {#each tokens || [] as token, i}
            <TokenRenderer
                {token}
                on:addsibling={(evt) => addSibling(evt, i)}
                on:savetokens={saveMessageTokens}
            />
        {/each}
    {:else}
        Token error
    {/if}
</div>
