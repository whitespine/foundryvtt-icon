<script>
    import { getContext } from "svelte";

    let doc = getContext("tjs_doc");
    
    function onEdit(event) {
        const attr = event.currentTarget.dataset.edit;
        const current = foundry.utils.getProperty(this.object, attr);
        const fp = new FilePicker({
            current,
            type: "image",
            callback: path => {
            $doc.update({img: path})
            },
            top: this.y,
            left: this.x + 100
        });
        return fp.browse();
    }
</script>

<img
    on:click={onEdit}
    src={$doc.img}
    title={$doc.name}
    {...$$restProps}
    height="100"
    width="100"
    alt="Character Portrait"
/>