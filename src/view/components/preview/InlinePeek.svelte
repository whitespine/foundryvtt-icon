<script>
    import { UUIDDocumentStore } from "../../../util/stores/uuid";

    /** @type {string}*/
    export let uuid;

    let doc = new UUIDDocumentStore(null);
    $: $doc = uuid;

    let tooltip = "...";
    $: {
        if ($doc instanceof foundry.documents.BaseJournalEntry) {
            let page = $doc.pages.contents[0];
            if (page) {
                tooltip = page.text.content;
                // Clean up uuids
                let re = /@UUID\[.*?\]\{(.*?)\}/gi;
                tooltip = tooltip.replaceAll(re, (m) => m.match(/\{(.*?)\}/)[1]);
            }
        } else if($doc) {
            tooltip = $doc.name;
        }
    }
</script>

<span data-tooltip={tooltip} on:click|stopPropagation={$doc?.sheet?.render(true, { force: true })}>
    <slot />
</span>

<style lang="scss">
    span {
        // background: var(--secondary-background);
        // border: var(--primary-border);
        text-decoration: underline;
        // border-radius: 10px;
        white-space: nowrap;
        word-break: break-all;
        cursor: pointer;
        padding: 0px 2px;
    }
</style>
