/**
 * @typedef {object} TransformContext
 *
 * @property {IconActor} [actor] The relevant actor
 */

import { localize } from "./misc";


class Transformer {
    /**
     * 
     * @param {TransformContext} context  Meta information
     * @param {Node} item Tagged/Text node to transform
     * @returns {Array<Node>} [] to consume, [identity] to not change, or any new value
     */
    apply(context, node) {
        let result = this.apply_inner(context, node);
        return result.filter(r => r).map(t => t instanceof Node ? t : new Node({text: t}));
    }

    apply_inner(context, node) {
        return [];
    }
}


class RegexTransformer extends Transformer {
    /** A utility for transforming possibly many instances of a regular expression
     * in a body of text into an arbitrary other sequence of data.
     * 
     * @param {RegExp} regex 
     * @param {((ctx: TransformContext, groups: string[]) => Array<Node | string>)} splitter Our split-handler
     */
    constructor(regex, splitter) {
        this.regex = regex;
        this.num_groups = (new RegExp(regex.toString() + '|')).exec('').length - 1;
        if (this.num_groups < 1) {
            throw new TypeError("Transforms must at least have one capturing group");
        }
        this.splitter = splitter;
    }

    apply_inner(context, node) {
        if (node.tag) return [node];

        let split = node.split(this.regex);
        let result = [];
        for (let base = 0; base < split.length; base += this.num_groups + 1) {
            // Add the normal split result
            if (split[base] || keep_empty) result.push(split[base]);
            // If there is more to grab, then apply func and splat that into the array
            if (base + this.num_groups < split.length) {
                let s = split.slice(base + 1, base + this.num_groups + 1);
                let applied = this.splitter(context, s);
                result.push(...applied);
            }
        }
        return result;
    }
}


/**
 * @typedef {object} TransformContext
 * @property {string} [options.text] The base text
 * @property {string} [options.tooltip] What shows on hover
 * @property {object} [options.dragdata] What should be dragged, if anything
 * @property {object} [options.roll] A JSON serialized roll
 * @property {object[]} [options.children] Child nodes to create
 */


/**
 * A pseudo-html node
 */
export class Node {
    /**
     * @param {TransformContext} options 
     */
    constructor(options = {}) {
        /**
         * HTML tag if applicable
         * @type {string | undefined}
         */
        this.tag = options.tag;
        /**
         * Text if applicable. Lower priority than tag
         * @type {string | undefined}
         */
        this.text = options.text;
        /**
         * HTML Element attributes if applicable. Only valid if tag exists
         * @type {Record<string, string> | undefined}
         */
        this.attributes = options.attributes; // Can be undefined. Only used if tag present
        /**
         * Child nodes if applicable. Only valid if tag exists
         * @type {Node[] | undefined}
         */
        this.children = options.children?.map(t => new Node(t)); // Only used if tag present

        // Misc attributes
        /**
         * Tooltip to add to a tag, if this is a tag
         * @type {string | undefined}
         */
        this.tooltip = options.tooltip;
        /**
         * What this item should be dragged as
         * @type {any | undefined}
         */
        this.dragdata = options.dragdata;
        /**
         * An embedded roll
         * @type {any | undefined}
         */
        this.roll = options.roll ? Roll.fromData(options.roll) : undefined;
        /**
         * A roll formula
         * @type {any | undefined}
         */
        this.formula = options.formula;

        if(!this.text && !this.tag) {
            console.warn("EMPTY NODE");
        }
    }

    /** 
     * Back into an object 
     * 
     * @returns {TransformContext}
     **/
    toObject() {
        return {
            text: this.text,
            tooltip: this.tooltip,
            dragdata: this.dragdata,
            children: this.children?.map(t => t.toObject()),
            roll: this.roll?.toJSON(),
            formula: this.formula,
        }
    }

}

/**
 * Initializes our transformer pipeline once all translations are available
 */
export function setupTransformers() {
    // Do some stuff generic from our localizations
    let definitions = {};
    for (let [k, v] of [
        ...Object.entries(game.i18n.translations.ICON.Glossary),
        ...Object.entries(game.i18n.translations.ICON.Statuses),
        ...Object.entries(game.i18n.translations.ICON.Effects),
    ]) {
        // Un-camel-case it
        let name = k.replaceAll(/([a-z])([A-Z])/g, "$1 $2")

        // Exclude ones that have bespoke logic
        const exclusions = ["fray", "gamble"];
        if (exclusions.includes(name.toLowerCase())) continue;

        // Assign to definitions
        definitions[name] = v;
    };

    // Build a transformer for each definition
    for (let [k, v] of definitions) {
        StaticTransformers.push(new RegexTransformer(
            new RegExp(`(${k})`, "i"),
            (_c, [text]) => [new Node({
                tag: span,
                tooltip: v,
                children: [
                    new Node({
                        text
                    })
                ]
            })]
        ));
    }

    // And some more specific ones
    // Substitute fray damage
    StaticTransformers.push(new RegexTransformer(
        /(\[?fray\]?)/ig,
        (ctx) => {
            if (ctx.actor.system.class?.fray_damage) {
                return [ctx.actor.system.class.fray_damage.toString()];
            } else {
                return ["fray"];
            }
        }
    ));

    // Substitute damage die
    StaticTransformers.push(new RegexTransformer(
        /(\[D\])/g,
        (ctx) => {
            if (ctx.actor.system.class?.damage_die) {
                return [`d${ctx.actor.system.class.damage_die}`];
            } else {
                return ["[D]"];
            }
        }
    ));

    // Make dice formulae in angle brackets rollable
    StaticTransformers.push(new RegexTransformer(
        /\[\[(\S+)\]\]/g,
        (ctx, m) => [
            new Node({
                formula: m[0],
                text: m[0]
            })
        ]
    ));

    // Make gamble rollable
    StaticTransformers.push(new RegexTransformer(
        /(Gamble)/ig,
        (ctx) => [new Node({
            text: "Gamble",
            tooltip: localize("ICON.Glossary.Gamble"),
            formula: "1d6"
        })]
    ));

    StaticTransformers.push(new RegexTransformer(
        /(\[name\])/ig,
        (ctx) => [ctx.actor?.name ?? "[name]"]
    ));
}
export const StaticTransformers = [];

/**
 * 
 * @param {HTMLElement} node 
 * @returns {Node | null} A node if we deem this node worthy of having one
 */
function htmlToNode(node) {
    if (node.tagName === undefined) {
        // Text node
        if (node.textContent) {
            return new Node({
                text: node.textContent
            });
        } else {
            return null;
        }
    } else {
        // An otherwise normal node
        let tag = node.tagName;
        let attrs = node.attributes;
        let children = [];
        for (let child of node.childNodes) {
            child = htmlToNode(child);
            if (child) children.push(child);
        }
        return new Node({
            tag,
            attrs,
            children
        });
    }
}

/**
 * 
 * @param {string} text Full text
 * @param {TransformContext} context Meta info some transformers care about
 * @param {Transformer[]} [transformers] Which transformers to use
 * @returns {Array<string | Node>} Fully processed text. Wrap in a div if you need to
 */
export function fullProcess(text, context, transformers = StaticTransformers) {
    // First parse to HTML
    const parser = new DOMParser();
    const html = parser.parseFromString(text, 'text/html');
    const body = html.body;
    let as_nodes = htmlToNode(body)?.children ?? [];

    /**
     * Recursively process an array of nodes. Processed bottom-up
     * @param {Array<Node>} arr 
     * @returns {Array<Node>}
     */
    function processArray(arr) {
        for (let transformer of transformers) {
            let result = [];

            // Process the individual elements
            for (let item of arr) {
                // Subprocess children
                item.children = processArray(item.children);
                result.push(...transformer.apply(item));
            }

            // Cleanup and combine consecutive text elements
            let final_result = [];
            for (let r of result) {
                if (r.text === "") continue; // Skip empty
                if (r.text && final_result[final_result.length - 1].text) {
                    final_result[final_result.length - 1].text += r.text;
                } else {
                    final_result.push(r);
                }
            }
        }
    }

    as_nodes = processArray(as_nodes);
    return as_nodes;
}