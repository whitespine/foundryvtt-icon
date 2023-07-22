export function augmentAction(handler, update_logic) {

    /**
     * Utility function for "extending" an action
     * 
     * @param {HTMLElement} node - Target element.
     *
     * @param {object} options - Options object
     * 
     * @param {TJSDocument<IconActor>} options.actor - Actor we are dropping items to
     * 
     * @param {Array<string>} options.types - Which item types are accepted
     *
     * @returns {import('svelte/action').ActionReturn} Action lifecycle methods.
     */

} 

export function dropItems(node, options) {
    let curr_options;
    let set_curr_options = (new_options) => {
        if(!new_options.actor instanceof TJSDocument) {
            throw new TypeError(`dropItems error: 'actor' must be an instance of IconActor.`);
        }

        if(!new_options.items instanceof Array) {
            throw new TypeError(`dropItems error: 'items' must be an array`);
        }
        curr_options = new_options
    }

    // Initialize the underlying handler with our actual handling logic
    set_curr_options(options);
    let wrapped = baseDropDocument(node, {
        drop_handler: (doc) => {
            // Already checked
            actor.get().createDescendantDocument("Item", doc.system._source.toObject());
            return null;
        },
        allow_drop: (doc) => {
            return (doc instanceof IconItem) && items.includes(doc.type);
        }
    });

    // 
    return {
        update: (new_options) => wrapped.update(new_options) && set_curr_options(new_options),
        destroy: wrapped.destroy
    }
}

/**
 * Fancy wrapper that handles initialization / cleanup of listeners, etc.
 * 
 * @param {HTMLElement} node Our target node
 * @param {Record<string, ((object, Event) => any)>} listeners - Maps a callback name (e.g. "click") to an augmented event listener. 
 *                                                               Listeners will be provided (options, event), where options is the current options value,
 *                                                               and event is the event they would normally receive.
 *                                                               These are not updated in future calls
 * @param {((object) => void)} [options_validator=null] - A special logic block for validating options
 */
export function easyAction(listeners, options_validator=null) {
    // Create our actual function body
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
}