<script>
    import { getContext } from "svelte";
    import { Token } from "../../../util/nlp";
    import TokenRenderer from "./TokenRenderer.svelte";
    import { TOKEN_STORES } from "../../../util/stores";

    /** @type {Token[] | (() => Token[])} Our default token sequence if we do not recover any from token store */
    export let initial_tokens;

    /** Used for saving changes to tokens. */
    export let key;

    /** Likewise */
    let msg = getContext("message");

    /** Used for allowing updates / initialization from persistent token store */
    let token_store = TOKEN_STORES.get(msg?.id || "transient", {});

    // Create our update loop thingy
    let tokens;
    $: {
        if ($token_store[key]) {
            tokens = $token_store[key].map((t) => new Token(t));
        } else {
            tokens = typeof initial_tokens === "function" ? initial_tokens() : initial_tokens;
        }
    }

    // Creates a new top level token. Purely a UI event.
    function addSibling(evt, i) {
        tokens = [...tokens.slice(0, i + 1), new Token(evt.detail), ...tokens.slice(i + 1)];
    }

    /**
     * If in a message & have a unique id, persists data changes to the DB
     * @param evt Event to handle
     */
    function saveTokens() {
        if (!key) return console.log("Not persisting change to keyless TokenSequence");
        if (!msg) return console.log("Not persisting change to messageless TokenSequence");

        let token_data = tokens.map((t) => t.toObject());
        msg.update({ [`flags.${game.system.id}.data.tokens.${key}`]: token_data });
    }
</script>

<div>
    {#each tokens || [] as token, i}
        <TokenRenderer {token} on:addsibling={(evt) => addSibling(evt, i)} on:savetokens={saveTokens} />
    {/each}
</div>
