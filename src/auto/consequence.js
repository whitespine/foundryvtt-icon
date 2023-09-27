import { scourHTML } from "../util/misc";

/**
 * @typedef {object} RawConsequence
 * 
 * @property {string | null} damage If string: id of built in status effects to apply. If object: A bespoke effect to apply
 * 
 * @property {Array<string | object>} statuses If string: id of built in status effects to apply. If object: A bespoke effect to apply
 * 
 * @property {string} text Plain text of what occurs
 *
 */
 

/**
 * @typedef {object} ParsedEffect
 *
 * @property {Array<"hit" | "miss" | "effect" | "area effect" | "exceed">} categories This effects deduced category. Usually just one!
 *
 * @property {RawConsequence} consequence This effects deduced consequence
 */


/**
 * 
 * @param {{effects: string[]}} ability_choice 
 * @returns {Array<ParsedEffect>} effects
 */
export function parseEffects(ability_choice) {
    /** @type {ParsedEffect[]} */
    let results = [];
    for(let effect of ability_choice.effects) {
        effect = scourHTML(effect);

        // Parse each effect individually. Some might make two separate effects
        let split_regex = /:\s*\}?/;
        let split_index = effect.search(split_regex);
        let split_match = effect.match(split_regex);
        split_index += split_match.length + 1;
        let pre, post;
        [pre, post] = [effect.slice(0, split_index), effect.slice(split_index)];

        // Crush the prefix to make it more easily parsed
        let crushed_pre = pre.toLowerCase().trim();

        // Split on ors
        let categories = crushed_pre.split(" or ");

        // Further postprocess the attack category
        if(categories.includes("attack")) {
            // Two general cases, auto hits and hit/misses
        } else {
            // Most other just emit a generic consequence
            results.push({
                categories,
                consequence: {
                    damage: null,
                    statuses: [],
                    text: post
                }
            })
        }
        let text = post;
    }
    return [];
}


/**
 * 
 * @param {RawConsequence[]} raws Raw consequences
 * @param {Actor} attacker The source actor for the abilities
 * @param {Actor[]} targets The targets. First is the actual target, rest are area effects
 */
export function bakeEffects(raws, attacker, targets) {

}
