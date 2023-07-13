import { ICON } from "../consts";

/**
 * Registers all system settings
 */
export function setupSettings() {
    // So we can migrate :)
    game.settings.register(game.system.id, ICON.settings.migration, {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: "0",
    });
}