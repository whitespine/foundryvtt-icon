import { writable, derived } from "svelte/store";

// Currently selected tokens
export const SELECTED_TOKENS = writable([]);
// Currently targeted tokens
export const TARGETED_TOKENS = writable([]);
// The attacking actor token
export const ATTACKER = derived(SELECTED_TOKENS, (arr) => arr[0] ?? null);
// The primary target token
export const PRIMARY_TARGET = derived(TARGETED_TOKENS, (arr) => arr[0] ?? null);
// The area target tokens. All non-first targets, essentially
export const AREA_TARGETS = derived(TARGETED_TOKENS, (arr) => arr.slice(1));

Hooks.on("controlToken", (token, controlled) => {
    if (controlled) {
        SELECTED_TOKENS.update((s) => {
            return [...s, token];
        });
    } else {
        SELECTED_TOKENS.update((s) => {
            return s.filter(t => t != token);
        });
    }
});

Hooks.on("targetToken", (user, token, targeted) => {
    if (user._id != game.user.id) {
        return;
    } // Not us
    if (targeted) {
        TARGETED_TOKENS.update((s) => {
            return [...s, token];
        });
    } else {
        TARGETED_TOKENS.update((s) => {
            return s.filter(t => t != token);
        });
    }
});