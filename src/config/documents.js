import { IconActor } from "../documents/actor";
import { IconItem } from "../documents/item";
import { IconTokenDocument } from "../documents/token";

/**
 * Configure all of our system documents
 */
export function setupDocuments() {
    // Setup classes
    CONFIG.Item.documentClass = IconItem;
    CONFIG.Actor.documentClass = IconActor;
    // CONFIG.ActiveEffect.documentClass = LancerActiveEffect;
    CONFIG.Token.documentClass = IconTokenDocument;

    CONFIG.Actor.trackableAttributes["player"] = {
        bar: ["hp", "vigor"],
        value: ["resolve"]
    };
    CONFIG.Actor.trackableAttributes["foe"] = {
        bar: ["hp", "vigor"],
        value: []
    };
    // CONFIG.Token.objectClass = LancerToken;
    // CONFIG.Combat.documentClass = LancerCombat;
    // CONFIG.Combatant.documentClass = LancerCombatant;
    // CONFIG.ui.combat = LancerCombatTracker;
}
