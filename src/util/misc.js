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

// Used for when we need uuids in a way that foundry won't fuck with
/**
 *
 * @param {object} obj An object with dotpath keys
 *
 * @returns {object} An object wherein all keys have had their periods replaced with ampersands
 */
export function simpleSlugifyObject(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.replaceAll(".", "&"), v]));
}

/**
 *
 * @param {object} obj An object wherein all keys have had their periods replaced with ampersands
 *
 * @returns {object} An object wherein all keys have had their ampersands returned to periods
 */
export function simpleUnslugifyObject(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.replaceAll("&", "."), v]));
}


/**
 * 
 * @param {Array<T>} existing_list 
 *
 * @param {T} new_item An item to add to the list
 *
 * @param {T | null | undefined} insertion_point Where we want to insert it before, possibly
 *
 * @param {boolean} replace_duplicates If true, then old instances of new_item will be removed
 */
export function simpleMixList(existing_list, new_item, insertion_point, replace_duplicates = true) {
    // Pre filter
    if (replace_duplicates) {
        existing_list = existing_list.filter((x) => x !== new_item);
    }

    // Find where it goes
    let index = existing_list.indexOf(insertion_point);
    if (index === -1) {
        return [...existing_list, new_item]; // Tack on the end
    } else {
        return [...existing_list.slice(0, index), new_item, ...existing_list.slice(index)];
    }
}

/**
 * Gets, in the following order of priority:
 * Synthetic Actor Token Image -> Prototype Token Image -> Actor image
 *
 * @param {Actor | Token} actor Actor to get token image of possibly
 * @param {string} def Default value
 *
 * @returns {string} Image path
 */
export function actorTokenImage(actor, def = null) {
    def = def ?? "icons/svg/mystery-man.svg";
    const filter = (s) => (s && (s !== def)) ? s : null;
    if (!actor) {
        return def;
    } else if (actor instanceof Token) {
        // It's a token!
        return filter(actor.texture?.src) ?? filter(actor.actor?.prototypeToken?.texture?.src) ?? filter(actor.actor?.img) ?? def;
    } else {
        // It's an actor! Try to turn use it as a token first, but otherwise do normal path
        return filter(actor.token?.texture?.src) ?? filter(actor.prototypeToken?.texture?.src) ?? filter(actor.img) ?? def;
    }
}

/**
 * 
 * @param {string} raw_text 
 * @returns {string}
 */
export function scourHTML(raw_text) {
    // Get rid of html like tags
    raw_text = raw_text.replaceAll(/<\s*\/?\s*\W+\s*>/g, "");

    // Substitute uuids for just their sub text
    let re = /@UUID\[.*?\]\{(.*?)\}/gi;
    raw_text = raw_text.replaceAll(re, (m) => m.match(/\{(.*?)\}/)[1]);

    return raw_text;
}