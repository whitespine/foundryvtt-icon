import TJSDocSheet from "../view/sheets/DocSheetApp";

/**
 *
 */
export function setupSheets() {
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);
    Actors.registerSheet(game.system.id, TJSDocSheet, { types: ["player"], makeDefault: true });
    /*
    Actors.registerSheet("lancer", LancerPilotSheet, { types: [EntryType.PILOT], makeDefault: true });
    Actors.registerSheet("lancer", LancerMechSheetLegacy, { types: [EntryType.MECH], makeDefault: true });
    Actors.registerSheet("lancer", LancerMechSheet, { types: [EntryType.MECH] }); // Not default yet
    Actors.registerSheet("lancer", LancerNPCSheet, { types: [EntryType.NPC], makeDefault: true });
    Actors.registerSheet("lancer", LancerDeployableSheet, {
      types: [EntryType.DEPLOYABLE],
      makeDefault: true,
    });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("lancer", LancerItemSheet, {
      types: [
        EntryType.SKILL,
        EntryType.TALENT,
        EntryType.CORE_BONUS,
        EntryType.RESERVE,
        EntryType.STATUS,
        EntryType.PILOT_ARMOR,
        EntryType.PILOT_WEAPON,
        EntryType.PILOT_GEAR,
        EntryType.MECH_SYSTEM,
        EntryType.MECH_WEAPON,
        EntryType.WEAPON_MOD,
        EntryType.NPC_FEATURE,
        EntryType.ORGANIZATION,
      ],
      makeDefault: true,
    });
    Items.registerSheet("lancer", LancerFrameSheet, { types: [EntryType.FRAME], makeDefault: true });
    Items.registerSheet("lancer", LancerLicenseSheet, { types: [EntryType.LICENSE], makeDefault: true });
    Items.registerSheet("lancer", LancerNPCClassSheet, {
      types: [EntryType.NPC_CLASS, EntryType.NPC_TEMPLATE],
      makeDefault: true,
    });
    */
}