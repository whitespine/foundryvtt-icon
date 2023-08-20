import {
    LancerCombat,
    LancerCombatant,
    LancerCombatTracker,
    getTrackerAppearance,
    setAppearance,
} from "lancer-initiative";

Hooks.on("init", () => {
    CONFIG.Combat.documentClass = LancerCombat;
    CONFIG.Combatant.documentClass = LancerCombatant;
    CONFIG.ui.combat = LancerCombatTracker;
    CONFIG.LancerInitiative = {
        module: game.system.id,
        templatePath: `systems/${game.system.id}/templates/combat-tracker.hbs`,
        def_appearance: {
            icon: "fas fa-chevron-circle-right",
            icon_size: 1.5,
            player_color: "#44abe0",
            friendly_color: "#44abe0",
            neutral_color: "#146464",
            enemy_color: "#d98f30",
            done_color: "#444444",
        },
    };

    // A config form for this can be found at
    // https://github.com/BoltsJ/lancer-initiative
    game.settings.register(game.system.id, "combat-tracker-appearance", {
        scope: "world",
        config: false,
        type: Object,
        onChange: setAppearance,
    });
    // Optional for systems
    game.settings.register(game.system.id, "combat-tracker-sort", {
        name: "LANCERINITIATIVE.SortTracker",
        hint: "LANCERINITIATIVE.SortTrackerDesc",
        scope: "world",
        config: true,
        type: Boolean,
        onChange: v => {
            CONFIG.LancerInitiative.sort = v;
            game.combats?.render();
        },
        default: false,
    });
    CONFIG.LancerInitiative.sort = game.settings.get(
        game.system.id,
        "combat-tracker-sort"
    );

    // Recommended to allow integrations to set up
    Hooks.callAll("LancerInitiativeInit");
    setAppearance(getTrackerAppearance());
});