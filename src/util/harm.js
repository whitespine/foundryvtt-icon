import { IconActor } from "../documents/actor";
import HarmApplication from "../view/apps/HarmApplication";

Hooks.on("getSceneControlButtons", (controls) => {
    let tokenControls = controls.find(control => control.name === "token")
    tokenControls.tools.push({
        name: "iconharm",
        title: "ICON.Harm.Title",
        icon: "fas fa-spider",
        onClick: async (away) => {
            new HarmApplication().render(true, { focus: true })
        },
        button: true
    });
});

/**
 * @typedef {object} HarmInstance Records an instance of computed harm. 
 *
 * @property {"damage" | "divine" | "piercing" | "vigor"} type The damage/heal type that is to be applied
 * 
 * @property {number} original_amount The original amount of damage, pre any reductions
 * 
 * @property {number} armor_reduction The amount that was reduced by armor
 * 
 * @property {number} amount The numeric change that is to be applied
 * 
 * @property {null | "half" | "ignore"} mod Was amount reduced by resistance? Or ignored entirely? 
 *                                          Tracked so we can cycle them and sanely track the value.
 */

/**
 * @typedef {object} HarmRecord Records an instance of applied harm
 * 
 * @property {HarmInstance} harm The harm instance that was applied
 * 
 * @property {string} actor UUID of actor it was applied to
 * 
 * @property {number} original_hp The original hp value
 * @property {number} final_hp The hp value post harm/heal
 * 
 * @property {number} original_vigor The original vigor value
 * @property {number} final_vigor The vigor value post harm/heal
 */

/**
 * @typedef {Record<string, Array<HarmRecord>} HarmManifest Tracks harm to several actors, in the order it was inflicted
 */

/**
 * Compute an instance of harm against an actor
 * 
 * Note that mod is applied irrespectiv of normal rules surrounding divine
 * It is on the players to appropriately apply mods!
 * 
 * @param {IconActor} actor The actor to target
 * @param {"damage" | "piercing" | "divine" | "vigor"} type The harm/heal type
 * @param {number | "25%" | "50%" | "75%" | "vit"} amount The amount to harm/heal
 * @param {HarmInstance["mod"]} mod The modifier to apply
 * @returns {HarmInstance} A full harm instance
 */
export function computeHarm(actor, type, amount, mod) {
    if (!(actor instanceof IconActor)) throw new TypeError("First argument must be an actor");
    const valid_types = ["damage", "piercing", "divine", "vigor"];
    if (valid_types.includes(type)) throw new TypeError(`Second argument must be one of ${valid_types.join('|')}`);

    // First parse the amount
    if (typeof amount === "string") {
        switch (amount) {
            case "25%":
                amount = Math.round(actor.system.hp.max / 4 * 1);
                break;
            case "50%":
                amount = Math.round(actor.system.hp.max / 4 * 2);
                break;
            case "75%":
                amount = Math.round(actor.system.hp.max / 4 * 3);
                break;
            case "vit":
            case "vitality":
                amount = actor.system.class?.vitality ?? 0;
                break;
            default:
                // Parse it as a string
                amount = parseInt(amount);
                if (isNaN(amount)) throw new TypeError("Third argument must be a number, or 25%|50%|75%|vit");
        }
    }

    // Then handle the type/mods/armor
    let original_amount = amount;
    let armor_reduction = 0;
    let rounded = false;
    switch (type) {
        case "damage":
            // Reduced by armor
            armor_reduction = Math.min(actor.system.armor ?? 0, amount);
            amount -= armor_reduction;
        case "piercing":
        // Reduced by resistance / ignore AFTER armor. 
        case "divine":
        // Allow for reducing divine, but in svelte component show a warning on tooltip maybe
        case "vigor":
            // Rarely will we really want to halve or ignore vigor, but it doesn't hurt to have it as an option
            if (mod === "ignore") {
                amount = 0;
            } else if (mod === "half") {
                rounded = !!(amount % 2);
                amount = Math.ceil(amount / 2);
            }
            break;
    }

    // Freeze to enforce immutability
    return Object.freeze({
        type,
        original_amount,
        amount,
        armor_reduction: armor_reduction,
        mod
    });
}

/**
 * Computes the before/after hp values if the given harm instance is applied to an actor.
 * 
 * Harm instances are not modified. 
 * Does not actually modify actor
 * Note that inflictHarm should be called between each planHarm, 
 * or else the plans will be made without context of each other.
 * 
 * @param {IconActor} actor The actor to affect
 * @param {HarmInstance[]} harm_instances The harm instance to apply
 * @returns {HarmRecord[]} Records of the damage applied
 */
export function planHarm(actor, harm_instances) {
    let result = [];

    // Get initial values
    let final_hp = actor.system.hp.value;
    let final_vigor = actor.system.vigor.value;

    for (let harm_instance of harm_instances) {
        let { amount, type } = harm_instance;
        let step_original_hp = final_hp; // From the last step
        let step_original_vigor = final_vigor; // From the last step

        // Handle application
        if (type === "vigor") {
            final_vigor = step_original_vigor + amount;
            if (final_vigor > actor.system.class.vitality ?? 0) { // If no vitality, forbid
                final_vigor = actor.system.class.vitality ?? 0;
            }
        } else if (type === "divine") {
            // Ignores vigor
            final_hp = step_original_hp - amount;
            if (final_hp < 0) final_hp = 0;
        } else {
            // If vigor totally covers it, only affect vigor
            if (step_original_vigor >= amount) {
                final_vigor = step_original_vigor - amount;
            } else {
                // Otherwise assume damage is split
                amount -= step_original_vigor;
                final_vigor = 0;
                final_hp = step_original_hp - amount;
                if (final_hp < 0) final_hp = 0;
            }
        }

        // Return our record
        result.push({
            harm,
            actor: actor.uuid,
            original_hp: step_original_hp,
            original_vigor: step_original_vigor,
            final_hp,
            final_vigor,
        });
    }
    return result;
}



/**
 * Alters a harm instance to have a specific modifier
 * 
 * WIP - doesn't work, might not be needed.
 * 
 * @param {HarmInstance} harm_instance The record to modify
 * @param {HarmInstance["mod"]} new_mod Its new mod value
 * @returns {HarmInstance} A new instance
 */
export function changeMod(harm_instance, new_mod) {
    if (harm_instance.mod === "half") {
        if (new_mod === "half") {
            // No change! Already frozen, so just return
            return harm_instance;
        } else if (new_mod === "ignore") {
            // Need to heal by the inflicted amount
            return Object.freeze({
                ...harm_instance,
                amount: 0
            });
        } else {
            // Need to heal by the inflicted amount
            return Object.freeze({
                ...harm_instance,
                amount: 0
            });
        }
    } else if (harm_instance.mod === "ignore") {

        if (new_mod === "half") {

        } else if (new_mod === "ignore") {
            // No change! Shallow copy
            return { ...harm_record };
        } else {
            // We need to essentiaally fully apply it, since it was previously ignored
        }
    } else {
        // Assumed to be null
        if (new_mod === "half") {

        } else if (new_mod === "ignore") {

        } else {
            // No change! Shallow copy
            return { ...harm_record };
        }
    }
}

/**
 * Replace the given harm record with another.
 * This, in effect
 * 
 * @param {HarmRecord} harm_record The original harm, which is assumed to have bee
 * @param {HarmRecord | null} replacing_record The record being replaced, if applicable
 */
export async function inflictReplacedHarm(harm_record, replacing_record = null) {
    // Check values are the same
    if (replacing_record && replacing_record.harm.actor != harm_record.harm.actor) {
        throw new Error("When replacing harm, both instances must target the same actor!");
    }
}


/**
 * Apply the given harm manifest, in a vacuum. Basically just does damage to a unit!
 * 
 * @param {HarmManifest} harm_manifest The manifest to apply
 */
export async function applyManifest(harm_manifest) {
    let promises = [];
    for (let [uuid, records] of Object.entries(harm_manifest)) {
        let actor = fromUuidSync(uuid);
        if (!actor) {
            ui.notifications.warn(`Could not resolve actor ${uuid}`);
            continue;
        }
        let final = records[records.length - 1];
        if (!final) continue; // Empty list
        promises.push(actor.update({
            "system.hp.value": final.final_hp,
            "system.vigor.value": final.final_vigor,
        }));
    }
    await Promise.all(promises);
}

/**
 * Assumes a manifest whose HarmInstances have been edited in place.
 * Rebuilds its harm records from the embedded harm instances.
 * 
 * @param {HarmManifest} manifest The manifest to rebuild
 * @returns {HarmManifest} New manfiest
 */
export function replayManifest(manifest) {
    let new_manifest = {};
    for (let [uuid, records] of Object.entries(manifest)) {
        let actor = fromUuidSync(uuid);
        if (!actor) {
            ui.notifications.warn(`Could not resolve actor ${uuid}`);
            continue;
        }
        new_manifest[uuid] = planHarm(actor, records.map(r => r.harm));
    }
}

/**
 * Get or create the most recent HarmManifest chat message.
 * @returns {ChatMessage} message
 */
export async function getCurrentHarmManifestMessage() {
    // Only look at the most recent message
    let mrm = game.messages.contents[game.message.contents.length - 1];
    if(mrm.getFlag(game.system.id, "data")?.type === "harm") {
        return mrm;
    } else {
        return ChatMessage.create({
            [`flags.${game.system.id}.data`]: {
                type: "harm",
                harm_manifest: {}
            }
        });
    }
}

/**
 * Does quite a bit of work. 
 * 1. Gets the most recent harm manifest message
 * 2. Modifies it to include the provided harm instance
 * 3. Applies the damage to the actor
 * 
 * @param {*} actor 
 * @param {*} harm_instance 
 */
export async function quickDamage(actor, harm_instance) {

}