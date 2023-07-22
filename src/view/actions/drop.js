import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
import { IconActor } from '../../documents/actor';
import { IconItem } from '../../documents/item';
import { baseDropDocumentAction as baseDropDocument } from '../../util/dragdrop';

/**
 * Provides a basic action to update a Foundry document on change events.
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