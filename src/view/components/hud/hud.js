import { writable } from "svelte/store";
import AttackHud from "./AttackHUD.svelte";
import HarmHud from "./HarmHUD.svelte";

let harm_hud = null;
let attack_hud = null;

export const SHOW_HARM_HUD = writable(false);
export const SHOW_ATTACK_HUD = writable(false);

Hooks.on("ready", () => {
    harm_hud = new HarmHud({
        target: document.body,
    });
    attack_hud = new AttackHud({
        target: document.body,
    });
});
