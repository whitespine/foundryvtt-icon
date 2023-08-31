<svelte:options accessors={true} />

<script>
    import { ApplicationShell } from "#runtime/svelte/component/core";
    import { ICON } from "../../consts";

    export let elementRoot;
    export let app;

    const credits = [
        {
            name: "Frozedon",
            img: "https://avatars.githubusercontent.com/u/22649652?s=48&v=4",
            description: "For creating the ICON Foe JSON Data, without which you would have to make them all yourself",
            link: "https://github.com/Frozedon/IconFoeJson",
        },
        {
            name: "Exocist",
            img: "https://avatars.githubusercontent.com/u/15604711?s=48&v=4",
            description:
                "For creating the ICON Simple Worldbuilding System, without which the rest of the compendium data would not exist",
            link: "https://github.com/Exocist/ICON-1.45-WIP",
        },
        {
            name: "TyphonJS (AKA Michael)",
            img: "https://avatars.githubusercontent.com/u/94969292?s=48&v=4",
            description:
                "For creating the TyphonJS library, making modern web development in foundry simple and overall development of this module a thoroughly enjoyable experience",
            link: "https://github.com/typhonjs-fvtt-demo",
        },
    ];

    // Close this welcome message, foreevr!
    function clear() {
        game.settings.set(game.system.id, ICON.settings.welcome, false);
        app.close();
    }
</script>

<ApplicationShell bind:elementRoot>
    <main>
        <h1>Welcome, ICON!</h1>
        <p>
            This system is still very much a work in progress. Make an issue on the github for issues encountered. I
            hope you enjoy this work, but please bear in mind that I am a solo developer doing this freely in my spare
            time - improvements will come when they come.
        </p>

        <h2>Special thanks to:</h2>
        {#each credits as credit}
            <div class="credit">
                <img src={credit.img} />
                <h3>{credit.name}</h3>
                <p>{credit.description}</p>
                <a href={credit.link}>{credit.link}</a>
            </div>
        {/each}
        <div />
        <button on:click={clear}>Thanks! (Do not show again)</button>
    </main>
</ApplicationShell>

<style lang="scss">
    main {
        text-align: center;
        display: flex;
        flex-direction: column;
    }

    .credit {
        display: grid;
        border-bottom: var(--primary-background);
        grid-template:
            "img title" 30px
            "img body" 1fr
            "img link" 30px / 100px 1fr;

        img {
            grid-area: img;
            width: 100px;
            height: 100px;
        }
        h3 {
            grid-area: title;
        }
        p {
            grid-area: body;
        }
        a {
            grid-area: link;
        }
    }
</style>
