<script>
    import { createEventDispatcher } from "svelte";
    import { ICON } from "../../../consts";
    import { quickDamage } from "../../../util/harm";

    // How much damage/vigor it grants
    /**
     * @type {string | number}
     */
    export let value;
    let svalue;
    $: svalue = value?.toString() ?? 0;
    let smalltext;
    $: smalltext = svalue.length > 1;

    // Dispatch harm
    function hurt(type) {
        dispatch("harm", {
            type,
            value: svalue
        });
    }

    const dispatch = createEventDispatcher();
</script>

<div class="root" {...$$restProps}>
    <div class="underlay">
        <span class:smalltext>{value}</span>
    </div>
    <div class="overlay">
        {#each ["damage", "piercing", "divine", "vigor"] as type}
            <i
                style="grid-area: {type}"
                class="{ICON.css[type]} fa-lg"
                on:click={() => hurt(type)}
                data-tooltip="{type} {value}"
            />
        {/each}
    </div>
</div>

<style lang="scss">
    div {
        width: 56px;
        height: 56px;

        text-align: center;
        align-items: center;
        justify-content: center;

        color: var(--secondary-color);
    }

    .root {
        margin: 4px;
        border: var(--secondary-border);
        background-color: var(--secondary-background);
        border-radius: 5px;
        border-radius: 15px;
        position: relative;
    }

    .underlay {
        position: absolute;
        display: flex;
        align-items: center;

        span {
            font-weight: bold;
            font-size: 46px;
            font-family: monospace;

            &.smalltext {
                font-size: 26px;
            }
        }
    }

    .overlay {
        position: absolute;
        display: grid;

        // Fade in on hover
        transition: opacity 0.3s;
        opacity: 0;
        &:hover {
            opacity: 0.8;
        }

        grid-template:
            "damage piercing" 28px
            "divine vigor" 28px / 28px 28px;

        i {
            color: rgb(18, 35, 57);
            cursor: pointer;
            &:hover {
                opacity: 1.0;
                color: rgb(133, 228, 255);
            }
        }
    }
</style>
