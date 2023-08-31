import { TJSDocument } from '#runtime/svelte/store/fvtt/document';
import { resolveDotpath } from '../../util/paths';

/**
 * Provides a basic action to update a Foundry document on change events.
 *
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} node - Target input element.
 *
 * @param {{ doc: TJSDocument, path: string }}  options - Options
 *
 * @param initial_options
 *
 * @returns {import('svelte/action').ActionReturn} Action lifecycle methods.
 */
export function updateDoc(node, initial_options = {}) {
    // Validate our node
    if (!(node instanceof HTMLInputElement) && !(node instanceof HTMLSelectElement) &&
        !(node instanceof HTMLTextAreaElement)) {
        throw new TypeError(
            `updateDoc error: 'node' must be an instance of HTMLInputElement, HTMLSelectElement, or HTMLTextAreaElement.`);
    }

    // Setup updateable options
    let doc;
    let path; 
    let current_doc_val;
    let unsubscribe;
    /**
     *
     * @param new_options
     */
    function setOptions(new_options) {
        // Clear old if needed
        if (unsubscribe) {
unsubscribe();
}

        doc = new_options.doc;
        path = new_options.path;

        // Validate
        if (!(doc instanceof TJSDocument)) {
            throw new TypeError(`updateDoc error: 'doc' must be an instance of TJSDocument.`);
        }

        if (typeof path !== 'string') {
            throw new TypeError(`updateDoc error: 'path' must be a string.`);
        }

        unsubscribe = doc.subscribe(onDocChange);
    }
    setOptions(initial_options);
    

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
        let value = ev.target.type === "checkbox" ? ev.target.checked : ev.target.value;

        document.update({ [path]: value });
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
        update: setOptions,

        destroy: () => {
            removeListeners();
            unsubscribe();
        }
    };
}