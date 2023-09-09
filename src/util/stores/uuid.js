import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

// Custom store for resolving a uuid
export class UUIDDocumentStore {
    constructor(initial, options = {}) {
        this.uuid = null;
        this.wrapped_store = new TJSDocument(undefined, options);
        this.set(initial);
    }

    /**
     * 
     * @param {string} document The new uuid, a document, or null/undefined
     *
     * @param {object} options Options to pass to underlying TJSDocument store
     */
    set(document, options = {}) {
        // Attempt to resolve before passing down to wrapped store
        if (document instanceof foundry.abstract.Document) {
            // if(document.uuid === this.uuid) return; // Nothing to do
            this.uuid = document.uuid;
            this.wrapped_store.set(document, options);
        } else if (typeof document === "string") {
            // if(document === this.uuid) return; // Nothing to do
            this.uuid = document;
            fromUuid(document).then((x) => {
                // Only proceed if uuids still match
                if (this.uuid === document) {
                    this.wrapped_store.set(x ? x : undefined, options);
                }
            });
        } else {
            // Just set as undefined
            this.uuid = null;
            this.wrapped_store.set(undefined, options);
        }
    }

    // Just proxy the subscribe method
    subscribe(handler) {
        return this.wrapped_store.subscribe(handler);
    }
}