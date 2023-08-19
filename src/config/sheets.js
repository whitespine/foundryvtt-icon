import TJSDocSheet from "../view/sheets/DocSheetApp";

/**
 *
 */
export function setupSheets() {
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);
    Actors.registerSheet(game.system.id, TJSDocSheet, { types: ["player", "foe", "summon"], makeDefault: true });
    Items.registerSheet(game.system.id, TJSDocSheet, { types: ["ability", "bond", "job", "bond-power", "relic"], makeDefault: true });
}
