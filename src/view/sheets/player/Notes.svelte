<script>
    import { getContext } from "svelte";
    import ProseMirrorEditor from "../../components/generic/ProseMirrorEditor.svelte";

    let actor = getContext("tjs_actor");
</script>

<section>
    <h3>Notes:</h3>
    <ProseMirrorEditor doc={$actor} path={"system.biography"} auto={true} />
</section>

<style lang="scss">
</style>
