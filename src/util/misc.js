// Shorthand for localization
/**
 * @param {string} s The localization path
 *
 * @returns {string} The localized string, or the localization path if not successful
 */
export function localize(s) {
    return game.i18n.localize(s) ?? s;
}