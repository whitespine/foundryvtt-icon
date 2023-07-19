import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
import { resolveDotpath } from '../../util/paths';

/**
 * Provides a basic action to update a Foundry document on change events.
 *
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} node - Target input element.
 *
 * @param {{ doc: TJSDocument, path: string }}  options - Options
 *
 * @returns {import('svelte/action').ActionReturn} Action lifecycle methods.
 */
export function updateDoc(node, { doc, path } = {}) {
    if (!(node instanceof HTMLInputElement) && !(node instanceof HTMLSelectElement) &&
        !(node instanceof HTMLTextAreaElement)) {
        throw new TypeError(
            `updateDoc error: 'node' must be an instance of HTMLInputElement, HTMLSelectElement, or HTMLTextAreaElement.`);
    }

    if (!(doc instanceof TJSDocument)) {
        throw new TypeError(`updateDoc error: 'doc' must be an instance of TJSDocument.`);
    }

    if (typeof path !== 'string') {
        throw new TypeError(`updateDoc error: 'path' must be a string.`);
    }

    // Listens to the TJS doc to track out current doc[...path] valuee
    let current_doc_val;

    const unsubscribe = doc.subscribe(onDocChange);

    /**
     * Updates `doc` w/ current focused state.
     *
     * @param {Event}  ev - Change event.
     */
    function onChange(ev) {
        const document = doc.get();
        if (!document) {
            console.warn('updateDoc.onChange warning: no associated document on change.');
            return;
        }

        document.update({ [path]: ev.target.value });
    }

    /**
     * @param {foundry.abstract.Document} changeDoc - Foundry document changing.
     */
    function onDocChange(changeDoc) {
        if (!changeDoc) {
            console.warn('updateDoc.onDocChange warning: no associated document on change.');
            return;
        }

        const new_val = resolveDotpath(changeDoc, path);
        if (current_doc_val !== new_val) {
            current_doc_val = new_val;
            if (typeof current_doc_val === "boolean") {
                node.checked = new_val;
            } else {
                node.value = current_doc_val;
            }
        }
    }

    /**
     * Activate listeners.
     */
    function activateListeners() {
        node.addEventListener('change', onChange);
    }

    /**
     * Remove listeners.
     */
    function removeListeners() {
        node.removeEventListener('change', onChange);
    }

    activateListeners();

    return {
        // Currently not implemented, but this is where you'd update the options for this action.
        // IE changing the TJSDocument or path field.
        update: () => { },

        destroy: () => {
            removeListeners();
            unsubscribe();
        }
    };
}