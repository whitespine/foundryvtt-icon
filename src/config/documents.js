import { IconActor } from "../documents/actor";
import { IconItem } from "../documents/item";

/**
 * Configure all of our system documents
 */
export function setupDocuments() {
    // Setup classes
    CONFIG.Item.documentClass = IconItem;
    CONFIG.Actor.documentClass = IconActor;
    // CONFIG.ActiveEffect.documentClass = LancerActiveEffect;
    // CONFIG.Token.documentClass = LancerTokenDocument;
    // CONFIG.Token.objectClass = LancerToken;
    // CONFIG.Combat.documentClass = LancerCombat;
    // CONFIG.Combatant.documentClass = LancerCombatant;
    // CONFIG.ui.combat = LancerCombatTracker;
}
