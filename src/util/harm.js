import { IconActor } from "../documents/actor";
import { simpleSlugifyObject, simpleUnslugifyObject } from "../util/misc";
import { SHOW_HARM_HUD } from "../view/components/hud/hud";
import { getStore } from "./misc";
import { adminUpdateMessage } from "./socket";

Hooks.on("getSceneControlButtons", (controls) => {
    let tokenControls = controls.find((control) => control.name === "token");
    tokenControls.tools.push({
        name: "iconharm",
        title: "ICON.Harm.Title",
        icon: "fas fa-spider",
        onClick: async (away) => {
            showHarmApplication();
        },
        button: true
    });
});

let harmAppId = null;

/**
 * Shows the harm application singleton
 */
export async function showHarmApplication() {
    SHOW_HARM_HUD.set(!getStore(SHOW_HARM_HUD));
    /*
    let app;
    if (harmAppId && ui.windows[harmAppId]) {
        app = ui.windows[harmAppId];
    } else {
        app = new HarmApplication();
    }
    await app.render(true, { focus: true });
    harmAppId = app.appId;
    */
}

/**
 * @typedef {object} HarmInstance Records an instance of computed harm. 
 *
 * @property {"damage" | "divine" | "piercing" | "vigor"} type The damage/heal type that is to be applied
 * 
 * @property {number} original_amount The original amount of damage, pre any reductions
 * 
 * @property {string} dice_result The human readable result of the dice roll
 * 
 * @property {Array<[string, value]>} deltas The changes to final damage by flags & armor, as key-value pairs. Ordered!
 * 
 * @property {number} amount The numeric change that is to be applied
 * 
 * @property {Array<"resistance" | "immune" | "shattered" | "vulnerable" | "weakened" | "pacified">} flags 
 *           All auxilary effects on damage, tracked so we can cycle them and sanely track the value.
 */

/**
 * @typedef {object} HarmRecord Records an instance of applied harm
 * 
 * @property {HarmInstance} harm The harm instance that was applied
 * 
 * @property {string} actor UUID of actor it was applied to
 * 
 * @property {number} original_hp The original hp value
 *
 * @property {number} final_hp The hp value post harm/heal
 *
 * @property {boolean} original_bloodied Were they bloodied before?
 *
 * @property {boolean} final_bloodied Are they bloodied after?
 * 
 * @property {number} original_vigor The original vigor value
 *
 * @property {number} final_vigor The vigor value post harm/heal
 */

/**
 * @typedef {Record<string, Array<HarmRecord>} HarmManifest Tracks harm to several actors, in the order it was inflicted
 */

/**
 * Compute an instance of harm against an actor
 * 
 * It is on the players to appropriately apply flags!
 * 
 * @param {IconActor} actor The actor to target
 *
 * @param {"damage" | "piercing" | "divine" | "vigor"} type The harm/heal type
 *
 * @param {number | "25%" | "50%" | "75%" | "vit"} amount The amount to harm/heal
 * 
 * @param {string} dice_result The string representation of the dice roll
 *
 * @param {HarmInstance["flags"]} flags The flags to apply
 *
 * @returns {HarmInstance} A full harm instance
 */
export function computeHarm(actor, type, amount, dice_result, flags) {
    if (!(actor instanceof IconActor)) {
        throw new TypeError("First argument must be an actor");
    }
    const valid_types = ["damage", "piercing", "divine", "vigor"];
    if (!valid_types.includes(type)) {
        throw new TypeError(`Second argument must be one of ${valid_types.join('|')}, not ${type}`);
    }

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
                if (isNaN(amount)) {
                    throw new TypeError("Third argument must be a number, or 25%|50%|75%|vit");
                }
        }
    }

    // Then handle the type/flags/armor
    let original_amount = amount;
    let deltas = [];

    // Attacker effects apply first
    if (flags.includes("weakened") && amount > 0) {
        amount = Math.max(0, amount - 2);
        deltas.push(["weakened", -2]);
    }
    if (flags.includes("pacified")) {
        let prior = amount;
        amount = Math.ceil(amount / 2);
        let delta = amount - prior;
        if (delta) {
            deltas.push(["pacified", delta]);
        }
    }

    // All types except vigor are increased by vulnerable
    if (flags.includes("vulnerable") && type !== "vigor") {
        if (amount) {
            deltas.push(["vulnerable", 1]);
            amount++;
        }
    }

    switch (type) {
        case "damage":
            // Reduced by armor
            let prior_armor = amount;
            amount = Math.max(0, amount - (actor.system.class?.armor ?? 0));
            let armor_delta = amount - prior_armor;
            if (armor_delta) {
                deltas.push(["armor", armor_delta]);
            }
        case "piercing":
            // Reduced by resistance AFTER armor. 
            if (flags.includes("resistance")) {
                let prior_resist = amount;
                amount = Math.ceil(amount / 2);
                let resist_delta = amount - prior_resist;
                if (resist_delta) {
                    deltas.push(["resistance",]);
                }
            }
        case "divine":
            // No reductions target-side really applies to divines except immunity
            if (flags.includes("immune")) {
                if (amount) {
                    deltas.push(["immune", amount]);
                }
                amount = 0;
            }
            break;
        case "vigor":
            // Rarely will we really want to halve or ignore vigor, but it doesn't hurt to have it as an option
            if (flags.includes("immune")) {
                if (amount) {
                    deltas.push(["immune", amount]);
                }
                amount = 0;
            }
            break;
    }

    // Freeze to enforce immutability
    return Object.freeze({
        type,
        original_amount,
        amount,
        dice_result,
        deltas,
        flags
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
 *
 * @param {HarmInstance[]} harm_instances The harm instance to apply
 *
 * @returns {HarmRecord[]} Records of the damage applied
 */
export function planHarm(actor, harm_instances) {
    let result = [];

    // If the actor does not have hp, then return no records
    if (!actor.system.hp) {
        return result;
    }

    // Get initial values
    let final_hp = actor.system.hp.value;
    let final_vigor = actor.system.vigor.value;
    let bloodied_threshold = (actor.system.true_max_hp ?? actor.system.hp.max) / 2;

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
        } else if (type === "divine" || type === "piercing" || harm_instance.flags.includes("shattered")) {
            // Ignores vigor
            final_hp = step_original_hp - amount;
            if (final_hp < 0) {
                final_hp = 0;
            }
        } else {
            // If vigor totally covers it, only affect vigor
            if (step_original_vigor >= amount) {
                final_vigor = step_original_vigor - amount;
            } else {
                // Otherwise assume damage is split
                amount -= step_original_vigor;
                final_vigor = 0;
                final_hp = step_original_hp - amount;
                if (final_hp < 0) {
                    final_hp = 0;
                }
            }
        }

        // Return our record
        result.push({
            harm: harm_instance,
            actor: actor.uuid,
            original_hp: step_original_hp,
            original_vigor: step_original_vigor,
            original_bloodied: step_original_hp <= bloodied_threshold,
            final_hp,
            final_vigor,
            final_bloodied: final_hp <= bloodied_threshold,
        });
    }
    return result;
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
        if (!final) {
            continue;
        } // Empty list
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
 * @param {HarmManifest} manifest The manifest to rebuild. 
 *
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
        new_manifest[uuid] = planHarm(actor, records.map((r) => computeHarm(actor, r.harm.type, r.harm.original_amount, r.harm.dice_result, r.harm.flags)));
    }
    return new_manifest;
}

/**
 * Get or create the most recent HarmManifest chat message.
 *
 * @returns {Promise<ChatMessage>} message
 */
export async function getCurrentHarmManifestMessage() {
    // Only look at the most recent message
    let mrm = game.messages.contents[game.messages.contents.length - 1];
    if (mrm && mrm.getFlag(game.system.id, "svelte_msg_type") === "harm") {
        return mrm;
    } else {
        return ChatMessage.create({
            [`flags.${game.system.id}`]: {
                svelte_msg_type: "harm",
                harm_manifest: {}
            }
        });
    }
}

/**
 * Get or create the most recent HarmManifest manifest
 *
 * @param {Message} [message] The message to extract from. If not provided, uses most recent harm manifest message
 *
 * @returns {Promise<HarmManifest>} manifest Its manifest, {} if new
 */
export async function getHarmManifest(message = null) {
    message = message ?? await getCurrentHarmManifestMessage();

    /** @type {HarmManifest} */
    let manifest = message.getFlag(game.system.id, "harm_manifest") ?? {};
    manifest = simpleUnslugifyObject(manifest);

    return manifest;
}

/**
 * Update (or create) the current harm manifest with new records 
 *
 * @param {Message} message The message to update, or null for current
 *
 * @param {HarmManifest} manifest The new/updated manifest
 */
export async function setHarmManifest(message, manifest) {
    // Get the message
    message = message ?? await getCurrentHarmManifestMessage();

    // Replay the manifest
    manifest = replayManifest(manifest);

    // Slugify it
    manifest = simpleSlugifyObject(manifest);

    await adminUpdateMessage(message, {
        [`flags.${game.system.id}.harm_manifest`]: manifest
    });
}


/**
 * Performs the following
 * 1. Gets the most recent harm manifest message
 * 2. Modifies it to include the provided harm instance
 * Does not actually modify the actor.
 * 
 * @param {Array<[IconActor, HarmInstance]>} harms 
 */
export async function quickDamage(harms) {
    let manifest = await getHarmManifest();

    // Create a temporary new manifest entry
    for (let [actor, harm_instance] of harms) {
        if (!manifest[actor.uuid]) {
            manifest[actor.uuid] = [];
        }
        manifest[actor.uuid] = [
            ...manifest[actor.uuid],
            {
                harm: harm_instance
            }
        ];
    }

    // Replay the manifest
    await setHarmManifest(null, manifest);
}

/**
 * 
 * @param {Actor} actor Actor to check effects on
 *
 * @returns {HarmInstance["flags"]} Relevant flags on the attacker
 */
export function flagsForAttacker(actor) {
    /** @type {HarmInstance["flags"]} */
    let result = [];
    if (actor.effects.some((e) => e.name === "Weakened")) {
        result.push("weakened");
    }
    if (actor.effects.some((e) => e.name === "Pacified")) {
        result.push("pacified");
    }
    return result;
}

/**
 * 
 * @param {Actor} actor Actor to check effects on
 *
 * @returns {HarmInstance["flags"]} Relevant flags on the defender
 */
export function flagsForDefender(actor) {
    /** @type {HarmInstance["flags"]} */
    let result = [];
    if (actor.effects.some((e) => e.name === "Vulnerable")) {
        result.push("vulnerable");
    }
    if (actor.effects.some((e) => e.name === "Shattered")) {
        result.push("shattered");
    }
    return result;
}

/**
 * 
 * @param {number} die The damage die number
 *
 * @param {number} die_count How many damage die
 *
 * @param {number | string} flat_bonuses All the flat bonuses. Fray etc
 *
 * @param {number} bonus_damage How many instances of bonus damage they have
 */
export function buildDamageFormula(die, die_count, flat_bonuses, bonus_damage) {
    if (die_count <= 0) {
        return flat_bonuses.toString();
    } else if (bonus_damage <= 0) {
        return `${die_count}d${die} + ${flat_bonuses}`;
    } else {
        return `${die_count + bonus_damage}d${die}kh${die_count} + ${flat_bonuses}`;
    }
}