import { writable } from "svelte/store";
import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

/** 
 * Retrieves writeable stores by a unique key.
 * If the store does not exist, create it and set its vaalue to null
 */
export class KeyStoreLookup {
    constructor() {
        this.stores = new Map();
    }

    /**
     * Retrieve the store with the provided name
     *
     * @param {string} key Key to lookup
     *
     * @param {any} initial initial value if it does not exist
     */
    get(key, initial = null) {
        if (!this.stores.has(key)) {
            this.stores.set(key, writable(initial));
        }
        return this.stores.get(key);
    }

    /**
     * Nulls the specified key, effectively resetting any view dependent on it back to just showing initial tokens
     *
     * @param {string} key Key to clear
     */
    clear(key) {
        this.stores.get(key).set(null);
    }

    /**
     * Test function - should theoretically
     */
    clearAll() {
        for (let key of this.stores.keys()) {
            this.clear(key);
        }
    }

    /**
     * Set all of object into our entries. This is worded horribly
     *
     * @param {Record<string, any>} obj 
     */
    setFrom(obj) {
        for (let [k, v] of Object.entries(obj)) {
            this.get(k).set(v);
        }
    }
}

// Currently selected tokens
export const SELECTED_TOKENS = writable(new Set());
export const TARGETED_TOKENS = writable(new Set());

Hooks.on("controlToken", (token, controlled) => {
    if (controlled) {
        SELECTED_TOKENS.update((s) => {
            s.add(token);
            return s;
        });
    } else {
        SELECTED_TOKENS.update((s) => {
            s.delete(token);
            return s;
        });
    }
});

Hooks.on("targetToken", (user, token, targeted) => {
    if(user._id != game.user.id) return; // Not us
    if (targeted) {
        TARGETED_TOKENS.update((s) => {
            s.add(token);
            return s;
        })
    } else {
        TARGETED_TOKENS.update((s) => {
            s.delete(token);
            return s;
        })
    }
});

// Use this for tab selection
export const TAB_STORES = new KeyStoreLookup();

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
     * @param {object} options Options to pass to underlying TJSDocument store
     */
    set(document, options = {}) {
        // Attempt to resolve before passing down to wrapped store
        if(document instanceof foundry.abstract.Document) {
            this.uuid = document.uuid;
            this.wrapped_store.set(document, options);
        } else if(typeof document === "string") {
            this.uuid = document;
            fromUuid(document).then(x => {
                // Only proceed if uuids still match
                if(this.uuid === document) {
                    this.wrapped_store.set(x ? x : undefined, options);
                }
            })
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