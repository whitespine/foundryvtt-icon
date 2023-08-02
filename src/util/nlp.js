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
     * @param {((ctx: TransformContext, groups: string[]) => Array<any>)} func Our split-handler
     */
    constructor(regex, func) {
        this.regex = regex;
        this.num_groups = (new RegExp(regex.toString() + '|')).exec('').length - 1;
        if(this.num_groups < 1) {
            throw new TypeError("Transforms must at least have one capturing group");
        }
        this.func = func;
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
                let applied = this.func(context, s);
                result.push(...applied);
            }
        }
        return result;
    }
}

export class Token {
    /**
     * @param {string} text The base text
     * @param {string} tooltip What shows on hover
     * @param {object} dragdata What should be dragged, if anything
     */
    constructor(text, {
        tooltip,
        dragdata
    } = {}) {
        this.text = text;
        this.tooltip = tooltip;
        this.dragdata = dragdata
    }

    static simpleTransformer(keyword, data) {
        return new Transformer(
            new RegExp(`(${keyword})`, "i"),
            (_c, [base]) => [new Token(base, data)]
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
        const exclusions = [];
        if(exclusions.includes(k)) continue;
        AllTransformers.push(Token.simpleTransformer(pattern, {tooltip: v}));
    }

    // And some more specific ones
    AllTransformers.push(new Transformer(
        /(\[D\])/g,
        (ctx) => [ctx.actor?.system?.damage_die ? `${ctx.actor.system.damage_die}D` : "[D]"]
    ));
    AllTransformers.push(new Transformer(
        /(fray)/g,
        (ctx) => [ctx.actor?.system?.fray_damage ?? "fray"]
    ));
}
export const AllTransformers = [];


/**
 * 
 * @param {string} text Full text
 * @param {TransformContext} context Meta info some transformers care about
 * @returns {Array<string | Token>}
 */
export function fullProcess(text, context) {
    let arr = [text];
    for (let transformer of AllTransformers) {
        let newArr = [];
        for (let item of arr) {
            if (typeof item === "string") {
                // Transform any strings
                newArr.push(...transformer.splitApply(context, item, false));
            } else {
                // Keep other items as is
                newArr.push(item);
            }
        }
        arr = newArr;
    }
    return arr;
}