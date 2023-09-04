/**
 * Utility function for "extending" an action
 * 
 * @param {object} action - Base Action
 *
 * @param {object} options - Options object
 * 
 * @param {TJSDocument<IconActor>} options.actor - Actor we are dropping items to
 * 
 * @param {Array<string>} options.types - Which item types are accepted
 *
 * @param update_logic
 *
 * @returns {import('svelte/action').ActionReturn} Action lifecycle methods.
 */
export function augmentAction(action, update_logic) {
}


/**
 * Fancy wrapper that handles initialization / cleanup of listeners, etc.
 * Can wrap another action
 * 
 * @param {Record<string, ((object, Event) => any)>} listeners - Maps a callback name (e.g. "click") to an augmented event listener. 
 *                                                               Listeners will be provided (options, event), where options is the current options value,
 *                                                               and event is the event they would normally receive.
 *                                                               These are not updated in future calls
 *
 * @param {((object) => void)} [options_validator=null] - A special logic block for validating options
 */
export function easyActionBuilder(listeners, options_validator = null) {
    // Create our actual function body
    /** @type {import('svelte/action').Action<HTMLElement, object>} */
    const action = (node, initial_options) => {
        // Make our re-assignable options alias, and validate it if necessary
        options_validator?.(initial_options);
        let current_options = initial_options;

        // Instantiate + bind our listeners
        let mapped_listeners = {};
        for (let [k, v] of Object.entries(listeners)) {
            mapped_listeners[k] = (event) => v(current_options, event);
            node.addEventListener(k, mapped_listeners[k]);
        }

        // Create + return our teardown block
        return {
            update: (new_options) => {
                options_validator?.(new_options);
                current_options = new_options;
            },
            destroy: () => {
                for (let [k, v] of Object.entries(listeners)) {
                    node.removeEventListener(k, v);
                }
            }
        };
    };
    return action;
}


// Used for when we need uuids in a way that foundry won't fuck with
/**
 *
 * @param {object} obj An object with dotpath keys
 * @returns {object} An object wherein all keys have had their periods replaced with ampersands
 */
export function simpleSlugifyObject(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.replaceAll(".", "&"), v]));
}

/**
 *
 * @param {object} obj An object wherein all keys have had their periods replaced with ampersands
 * @returns {object} An object wherein all keys have had their ampersands returned to periods
 */
export function simpleUnslugifyObject(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.replaceAll("&", "."), v]));
}


/**
 * 
 * @param {Array<string>} existing_list 
 * @param {string} new_item An item to add to the list
 * @param {string | null | undefined} insertion_point Where we want to insert it before, possibly
 * @param {boolean} replace_duplicates If true, then old instances of new_item will be removed
 */
export function simpleMixUUIDList(existing_list, new_item, insertion_point, replace_duplicates = true) {
    // Pre filter
    if (replace_duplicates) {
        existing_list = existing_list.filter(x => x !== new_item);
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
 * @param {Actor} actor Actor to get token image of possibly
 * @returns {string} Image path
 */
export function actorTokenImage(actor) {
    const def = "icons/svg/mystery-man.svg";
    const filter = (s) => (s && (s !== def)) ? s : null;
    if (actor instanceof foundry.documents.BaseToken) {
        // It's a token!
        return filter(actor.texture?.src) ?? filter(actor.actor?.prototypeToken?.texture?.src) ?? filter(actor.actor?.img) ?? def;
    } else {
        // It's an actor! Try to turn use it as a token first, but otherwise do normal path
        return filter(actor.token?.texture?.src) ?? filter(actor.prototypeToken?.texture?.src) ?? filter(actor.img) ?? def;
    }
}