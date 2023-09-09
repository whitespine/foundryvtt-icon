import { writable } from "svelte/store";

// Currently selected tokens
export const SELECTED_TOKENS = writable(new Set());
// Currently targeted tokens
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
    if (user._id != game.user.id) {
        return;
    } // Not us
    if (targeted) {
        TARGETED_TOKENS.update((s) => {
            s.add(token);
            return s;
        });
    } else {
        TARGETED_TOKENS.update((s) => {
            s.delete(token);
            return s;
        });
    }
});