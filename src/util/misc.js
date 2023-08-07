// Shorthand for localization
/**
 * @param {string} s The localization path
 *
 * @returns {string} The localized string, or the localization path if not successful
 */
export function localize(s) {
    return game.i18n.localize(s) ?? s;
}

/**
 * Generate a chapter icon for a chapter
 * @param {number} n 
 * @returns {string} I, II, or III
 */
export function chapterIcon(n) {
    return {
        1: "I", 
        2: "Ⅱ", 
        3: "Ⅲ"
    }[n] ?? "I";
}