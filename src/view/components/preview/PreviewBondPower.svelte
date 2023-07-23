<script>
    import { slide } from "svelte/transition";
    /** @type {TJSDocument<IconItem>}*/
    export let power;

    let expanded = false;
    function toggleExpanded() {
        expanded = !expanded;
    }

    function sendToChat(evt) {
        evt.stopPropagation();
        ChatMessage.create({
            content: `${power.name}<br>${power.system.description}`
        })
    }
</script>

<div class="root">
    <div class="header" on:click={() => (expanded = !expanded)}>
        <img class="icon hover" src="icons/skills/social/diplomacy-writing-letter.webp">
        <img class="icon cover" src={power.img} on:click={sendToChat}>
        <span>{power.name}</span>
    </div>
    {#if expanded}
        <div class="description" transition:slide>{@html power.system.description}</div>
    {/if}
</div>

<style lang="scss">
    .root {
        display: flex;
        flex-direction: column;
        border: 1px solid black;
        border-radius: 10px;
        padding: 5px;
        margin: 2px;
        grid-template: 30px 1fr / 1fr;
    }
    .header {
        cursor: pointer;
        font-weight: bold;
        align-items: center;
        display: flex;
        flex-direction: row;
        .icon {
            width: 24px;
            height: 24px;
            transition: opacity 0.3s;  
            &.cover:hover {
                opacity: 0%;
            }
            &.cover {
                margin-left: -24px;
            }
        }
        span {
            margin-left: 5px;
        }
    }
</style>
