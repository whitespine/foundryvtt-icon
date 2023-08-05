import { writable } from "svelte/store";

/** 
 * Retrieves writeable stores by a unique key.
 * If the store does not exist, create it and set its vaalue to null
 */
class KeyStoreLookup {
    constructor() {
        this.stores = new Map();
    }

    /**
     * Retrieve the store with the provided name
     * @param {string} key Key to lookup
     * @param {any} initial initial value if it does not exist
     */
    get(key, initial=null) {
        if (!this.stores.has(key)) {
            this.stores.set(key, writable(initial));
        }
        return this.stores.get(key);
    }

    /**
     * Nulls the specified key, effectively resetting any view dependent on it back to just showing initial tokens
     * @param {string} key Key to clear
     */
    clear(key) {
        this.stores.get(key).set(null)
    }

    /**
     * Test function - should theoretically
     */
    clearAll() {
        for (let key of this.stores.keys()) this.clear(key);
    }
}

// We use this for tokens
export const TOKEN_STORES = new KeyStoreLookup();

// TODO remove
window.tokenstores = TOKEN_STORES;