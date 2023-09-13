import { TJSDialog } from "#runtime/svelte/application";

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
 *
 * @param {number} n 
 *
 * @returns {string} I, II, or III
 */
export function chapterIcon(n) {
    return {
        1: "I",
        2: "Ⅱ",
        3: "Ⅲ"
    }[n] ?? "I";
}

/**
 * Remove UUID refs 
 *
 * @param {string} text The text to clean up
 */
export function removeAllUUIDRefs(text) {
    return text.replaceAll(/@UUID\[.*?\]\{(.*?)\}/g, (_, n) => n);
}

/**
 * Read the value of a store. Can be expensive, so don't spam it if subscribing would make more sense
 * @param {store} store 
 */
export function getStore(store) {
    let val;
    // Sub and immediately unsub
    store.subscribe(x => val = x)();
    return val;
}

export function confirmDeleteDocument(doc) {
    TJSDialog.confirm({
        content: `Delete ${doc.name}?`,
        onYes: () => {
            // Delete the item entirely
            doc.delete();
        },
    });
}