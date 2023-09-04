/**
 * @typedef {object} TransformContext
 *
 * @property {IconActor} [actor] The relevant actor
 */

import { localize } from "./misc";


class Transformer {
    /**
     * 
     * @param {TransformContext} ctx  Meta information
     *
     * @param {IcoNode} node Tagged/Text node to transform
     *
     * @returns {Array<IcoNode>} [] to consume, [identity] to not change, or any new value
     */
    apply(ctx, node) {
        let result = this.apply_inner(ctx, node);
        return result.filter((r) => r).map((t) => t instanceof IcoNode ? t : new IcoNode({ text: t }));
    }

    apply_inner(ctx, node) {
        return [];
    }
}


class RegexTransformer extends Transformer {
    /**
     * A utility for transforming possibly many instances of a regular expression
     * in a body of text into an arbitrary other sequence of data.
     * 
     * @param {RegExp} regex 
     *
     * @param {((ctx: TransformContext, groups: string[]) => Array<IcoNode | string>)} splitter Our split-handler
     */
    constructor(regex, splitter) {
        super();
        this.regex = regex;
        this.num_groups = (new RegExp(`${regex.toString()}|`)).exec('').length - 1;
        if (this.num_groups < 1) {
            throw new TypeError("Transforms must at least have one capturing group");
        }
        this.splitter = splitter;
    }

    apply_inner(ctx, node) {
        if (node.tag) {
            return [node];
        }

        let split = node.text.split(this.regex);
        let result = [];
        for (let base = 0; base < split.length; base += this.num_groups + 1) {
            // Add the normal split result
            result.push(split[base]);
            // If there is more to grab, then apply func and splat that into the array
            if (base + this.num_groups < split.length) {
                let s = split.slice(base + 1, base + this.num_groups + 1);
                let applied = this.splitter(ctx, s);
                result.push(...applied);
            }
        }
        return result;
    }
}


/**
 * @typedef {object} NodeData
 *
 * @property {string} [options.tag] Tag, if it is a parent node
 * 
 * @property {string} [options.text] Text, if it is a text node. Overridden by tag
 *
 * @property {string} [options.tooltip] What shows on hover.
 *
 * @property {object} [options.dragdata] What should be dragged, if anything
 *
 * @property {object} [options.roll] A JSON serialized roll. Overridden by tag
 * 
 * @property {object} [options.formula] If provided, the node will act as a clickable roll button
 * 
 * @property {"small" | "medium" | "large"} [options.rollSize] Specifications for what size of roll this is / should create
 *
 * @property {object[]} [options.children] Child nodes to create
 */


/**
 * A pseudo-html node
 */
export class IcoNode {
    /**
     * @param {NodeData} options 
     */
    constructor(options = {}) {
        /**
         * HTML tag if applicable
         *
         * @type {string | undefined}
         */
        this.tag = options.tag;
        /**
         * Text if applicable. Lower priority than tag
         *
         * @type {string | undefined}
         */
        this.text = options.text;
        /**
         * HTML Element attributes if applicable. Only valid if tag exists
         *
         * @type {Record<string, string> | undefined}
         */
        this.attributes = options.attributes; // Can be undefined. Only used if tag present
        /**
         * Child nodes if applicable. Only valid if tag exists
         *
         * @type {IcoNode[] | undefined}
         */
        this.children = options.children?.map((t) => t instanceof IcoNode ? t : new IcoNode(t)); // Only used if tag present

        // Misc attributes
        /**
         * Tooltip to add to a tag, if this is a tag
         *
         * @type {string | undefined}
         */
        this.tooltip = options.tooltip;
        /**
         * What this item should be dragged as
         *
         * @type {any | undefined}
         */
        this.dragdata = options.dragdata;
        /**
         * An embedded roll to render instead of tag/text
         *
         * @type {Roll | undefined}
         */
        this.roll = options.roll ? Roll.fromData(options.roll) : undefined;
        /**
         * Roll formula if applicable
         *
         * @type {NodeData["formula"]}
         */
        this.formula = options.formula;
        /**
         * What size of roll this is / should create
         *
         * @type {NodeData["rollSize"]}
         */
        this.rollSize = options.rollSize;
    }

    /** 
     * Back into an object 
     * 
     * @returns {NodeData} In object form
     */
    toObject() {
        return {
            tag: this.tag,
            text: this.text,
            attributes: this.attributes,
            children: this.children?.map((t) => t.toObject()),

            tooltip: this.tooltip,
            dragdata: this.dragdata,
            roll: this.roll?.toJSON(),
            formula: this.formula,
            rollSize: this.rollSize
        };
    }

    /**
     * Gets the string content of this node
     *
     * @returns {string}
     */
    innerText() {
        let result = this.text ?? "";
        for (let child of this.children || []) {
            result += child.innerText();
        }
        return result;
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
        let name = k.replaceAll(/([a-z])([A-Z])/g, "$1 $2");

        // Exclude ones that have bespoke logic
        const exclusions = ["fray", "gamble"];
        if (exclusions.includes(name.toLowerCase())) {
            continue;
        }

        // Assign to definitions
        definitions[name] = v;
    }

    // Build a transformer for each definition
    for (let [k, v] of Object.entries(definitions)) {
        StaticTransformers.push(new RegexTransformer(
            new RegExp(`(${k})`, "i"),
            (_c, [text]) => [new IcoNode({
                tag: "span",
                tooltip: v,
                children: [
                    new IcoNode({
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
            if (ctx.actor?.system.class?.fray_damage) {
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
            if (ctx.actor?.system.class?.damage_die) {
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
            new IcoNode({
                tag: "span",
                formula: m[0],
                children: [new IcoNode({ text: m[0] })]
            })
        ]
    ));

    // Make gamble rollable
    StaticTransformers.push(new RegexTransformer(
        /(Gamble)/ig,
        (ctx) => [new IcoNode({
            tag: "span",
            tooltip: localize("ICON.Glossary.Gamble"),
            formula: "1d6",
            children: [
                new IcoNode({ text: "Gamble" })
            ]
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
 *
 * @returns {IcoNode | null} A node if we deem this node worthy of having one
 */
function htmlToNode(node) {
    if (node.tagName === undefined) {
        // Text node
        if (node.textContent) {
            return new IcoNode({
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
            if (child) {
                children.push(child);
            }
        }
        return new IcoNode({
            tag,
            attrs,
            children
        });
    }
}

/**
 * 
 * @param {string} text Full text
 *
 * @param {TransformContext} ctx Meta info some transformers care about
 *
 * @param {Transformer[]} [transformers] Which transformers to use
 *
 * @param options
 *
 * @returns {Array<IcoNode>} Fully processed text. Wrap in a div if you need to
 */
export function fullProcess(text, ctx, options = {}) {
    const transformers = options.transformers ?? StaticTransformers;

    // First parse to HTML
    const parser = new DOMParser();
    const html = parser.parseFromString(text, 'text/html');
    const body = html.body;
    let as_nodes = htmlToNode(body)?.children ?? [];

    /**
     * Recursively process an array of nodes. Processed bottom-up
     *
     * @param {Array<IcoNode>} arr 
     *
     * @returns {Array<IcoNode>}
     */
    function processArray(arr) {
        // Subprocess children first!
        for (let item of arr) {
            if (item.children?.length) {
                item.children = processArray(item.children);
            }
        }

        // Then process all current level elements with all transformers
        for (let transformer of transformers) {
            let result = [];

            // Process the individual elements
            for (let item of arr) {
                let transformed = transformer.apply(ctx, item);
                result.push(...transformed);
            }

            // Cleanup and combine consecutive text elements
            let final_result = [];
            for (let r of result) {
                if (r.text === "") {
                    continue;
                } // Skip empty
                if (r.text && final_result[final_result.length - 1]?.text) {
                    final_result[final_result.length - 1].text += r.text;
                } else {
                    final_result.push(r);
                }
            }
            arr = final_result;
        }
        return arr;
    }

    as_nodes = processArray(as_nodes);
    return as_nodes;
}

/**
 * As fullprocess, but returns result as a single Node always (if necessary, wraps in a div.)
 * 
 * @param {string} tag The tag to wrap in
 *
 * @param {string} text Raw html
 *
 * @param {TransformContext} context 
 *
 * @param {object} options See fullProcess
 */
export function fullProcessWrapped(tag, text, context, options = {}) {
    let result = fullProcess(text, context, options);
    if (result.length == 1 && result[0].tag) {
        return result[0];
    } else {
        return new IcoNode({
            tag,
            children: result
        });
    }
}