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
 * @param {((object) => void)} [options_validator=null] - A special logic block for validating options
 */
export function easyActionBuilder(listeners, options_validator=null) {
    // Create our actual function body
    /** @type {import('svelte/action').Action<HTMLElement, object>} */
    const action = (node, initial_options) => {
        // Make our re-assignable options alias, and validate it if necessary
        options_validator?.(initial_options);
        let current_options = initial_options;

        // Instantiate + bind our listeners
        let mapped_listeners = {};
        for(let [k, v] of Object.entries(listeners)) {
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
                for(let [k, v] of Object.entries(listeners)) {
                    node.removeEventListener(k, v);
                }
            }
        }
    }
    return action;
}


// Used for when we need uuids in a dic
export function simpleSlugifyObject(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.replaceAll(".", "_"), v]));
}

export function simpleUnslugifyObject(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.replaceAll("_", "."), v]));
}