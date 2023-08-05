/**
 * @typedef {object} TransformContext
 *
 * @property {IconActor} [actor] The relevant actor
 */



class Transformer {
    /** A utility for transforming possibly many instances of a regular expression
     * in a body of text into an arbitrary other sequence of data.
     * 
     * @param {RegExp} regex 
     * @param {((ctx: TransformContext, groups: string[]) => Array<string | Token>)} splitter Our split-handler
     */
    constructor(regex, splitter) {
        this.regex = regex;
        this.num_groups = (new RegExp(regex.toString() + '|')).exec('').length - 1;
        if (this.num_groups < 1) {
            throw new TypeError("Transforms must at least have one capturing group");
        }
        this.splitter = splitter;
    }

    /**
     * Splits the array using regex. Every set of matches from the split is fed into
     * our "func", and the result is splatted back into the array. 
     * @param {TransformContext} context Meta information
     * @param {IconActor} context.actor The actor we're populating this in the context of
     * @param {string} text Text to target
     * @param {boolean} keep_empty Whether to keep empty strings
     * @returns {Array<string | any>} Result
     */
    splitApply(context, text, keep_empty) {
        let split = text.split(this.regex);
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
 * @property {object[]} [options.children] Child tokens to create
 */

export class Token {
    /**
     * @param {TransformContext} options 
     */
    constructor(options = {}) {
        this.text = options.text;
        this.tooltip = options.tooltip;
        this.dragdata = options.dragdata;
        this.children = options.children?.map(t => new Token(t));
        this.roll = options.roll ? Roll.fromData(options.roll) : undefined;
        this.formula = options.formula;
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

    /** 
     * Tokenizes everything matching keyword with a fixed slice of data
     */
    static simpleTransformer(keyword, data) {
        return new Transformer(
            new RegExp(`(${keyword})`, "i"),
            (_c, [text]) => [new Token({ text, ...data })]
        );
    }
}

/**
 * Initializes our transformer pipeline once all translations are available
 */
export function setupTransformers() {
    // Do some stuff generic from our localizations
    let generic = [
        ...Object.entries(game.i18n.translations.ICON.Glossary),
        ...Object.entries(game.i18n.translations.ICON.Statuses),
        ...Object.entries(game.i18n.translations.ICON.Effects),
    ];
    for (let [k, v] of generic) {
        // Separate camel case for the keys
        let pattern = k.replaceAll(/([a-z])([A-Z])/g, "$1 $2")
        let t = Token.simpleTransformer(pattern, { tooltip: v })
        const exclusions = ["Fray", "Gamble"];
        if (!exclusions.includes(k)) {
            StaticTransformers.push(t);
        }
    }

    // And some more specific ones
    // Substitute fray damage
    StaticTransformers.push(new Transformer(
        /(fray)/g,
        (ctx) => {
            if (ctx.actor) {
                return [ctx.actor.system.fray_damage];
            } else {
                return ["fray"];
            }
        }
    ));

    // Substitute damage die
    StaticTransformers.push(new Transformer(
        /(\[D\])/g,
        (ctx) => {
            if (ctx.actor) {
                return [`d${ctx.actor.system.damage_die}`];
            } else {
                return ["[D]"];
            }
        }
    ));

    // Make dice formulae in angle brackets rollable
    StaticTransformers.push(new Transformer(
        /<(\[D\]|\s+|\+|\d+)+>/g,
        (ctx) => [ctx.actor?.system?.fray_damage ?? "fray"]
    ));

    // Make gamble rollable
    StaticTransformers.push(new Transformer(
        /(Gamble)/ig,
        (ctx) => [new Token({
            text: "Gamble",
            formula: "1d6"
        })]
    ));

    StaticTransformers.push(new Transformer(
        /(\[name\])/ig,
        (ctx) => [ctx.actor?.name ?? "[name]"]
    ));
}
export const StaticTransformers = [];


/**
 * 
 * @param {string} text Full text
 * @param {TransformContext} context Meta info some transformers care about
 * @returns {Array<string | Token>}
 */
export function fullProcess(text, context) {
    let arr = [text];
    for (let transformer of StaticTransformers) {
        let new_arr = [];
        for (let item of arr) {
            if (typeof item === "string") {
                // Transform any strings
                let processed = transformer.splitApply(context, item, false);

                // Push each of them, or just concat to existing string if both strings
                for(let new_item of processed) {
                    let tail = new_arr[new_arr.length - 1];
                    if(typeof new_item == "string" && typeof tail == "string") {
                        new_arr[new_arr.length - 1] = tail + new_item;
                    } else {
                        new_arr.push(new_item);
                    }
                }
            } else {
                // Keep other items as is
                new_arr.push(item);
            }
        }
        arr = new_arr;
    }
    arr = arr.map(text => typeof text === "string" ? new Token({ text }) : text);
    return arr;
}