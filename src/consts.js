// A namespace thingy for storing ICON system specific constants
export const ICON = {
    settings: {
        // Internal state
        migration: "migration_version",
        dsn_setup: "dice_so_nice_setup",
        welcome: "welcome_message",

        // Configurable
        show_foe_hp: "show_foe_hp",
    },
    flags: {
        swb_needs_commit: "swb_needs_commit",
        status_ongoing: "ongoing",
        status_saveable: "saveable",
        status_counter: "counter" // Forces showing counter even if it hasn't been given a counter value on
    },
    css: {
        // Resources
        hp: "fas fa-heart",

        // Damage types
        damage: "fas fa-burst",
        piercing: "fas fa-shield-slash",
        divine: "fas fa-stars",
        vigor: "fas fa-shield-plus",

        // Defense modifiers
        resistance: "fas fa-solid fa-shield-halved",
        immune: "fas fa-shield-cross",
        vulnerable: "fas fa-shield-slash",
        shattered: "fas fa-heart-crack",

        // Attack modifiers
        weakened: "fas fa-hexagon-minus",
        pacified: "fas fa-peace",
    },
};

// CSS icons for various concepts