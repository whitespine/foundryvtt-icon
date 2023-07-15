import { ItemModel } from "./item";

const fields = foundry.data.fields;

/**
 * Represents a single "option" within an ability, e.g. for combo or 
 */
export class ActionCostField extends fields.SchemaField {
    constructor(options = {}) {
        super({

        }, options);
    }
}

/**
 * Represents a single effect clause within an abilities seequence of effects
 * E.g. "Slay", "Attack", "Mark"
 */
export class ActionClauseField extends fields.SchemaField {
    constructor(options = {}) {
        super({
            // The "raw" provided text
            text: new fields.StringField(),
        }, options);
    }

    // Extend initialize to populate our deduced values
    initialize(value, model, options={}) {
        let rv = super.initialize(value, model, options);
        this.foo = "bar";
        return rv;

        // Our (possibly deduced, possibly explicit) clause and effect
        /*
        clause: new fields.StringField({choices: [
            "Attack", 
            "Effect", 
            "Area Effect", 
            "Terrain Effect",
            "Mark",
            "Special",
            "Slay",
            "Comeback",
            "Stance",
        ]}),
        */
    }
}

/**
 * Represents a target of some aspect of an ability
 */
export class TargetField extends fields.SchemaField {
    constructor(options) {
        super({
            type: new fields.StringField({
                choices: ["unit", "object", "space"]
            }),
            allegiance: new fields.StringField({
                choices: ["n/a", "self", "foe", "ally", "other", "object"],
            }),
        }, {
            initial: {
                who: "self",
                allegiance: "n/a"
            },
            ...options
        });
    }
}

/** For combo and other similar multiple-choice abilities */
export class AbilityChoiceField extends fields.SchemaField {
    constructor(options = {}) {
        super({
            // What is this sub-ability called? Leave null for default choice, typically
            name: new fields.StringField({ nullable: true, initial: null }),
            // How many actions does it take?
            actions: new fields.NumberField({ nullable: false, integer: true, min: 0, max: 2, initial: 1 }),
            // What is its listed range?
            range: new fields.StringField({}),

            // ------- FLAGS ---------------
            // Is it an attack?
            attack: new fields.BooleanField({ initial: false }),
            // Does it have true strike?
            true_strike: new fields.BooleanField({ initial: false }),
            // Does it have unerring?
            unerring: new fields.BooleanField({ initial: false }),
            // Is it an interrupt, and if so how often can it be used?
            interrupt: new fields.NumberField({ nullable: false, integer: true, min: 0, initial: 0 }),

            // ------- COSTS ---------------
            // Costs / generates a combo token
            combo: new fields.NumberField({ initial: 0, choices: [-1, 0, 1] }),
            // Costs X resolve
            resolve: new fields.NumberField({ nullable: false, integer: true, min: 0, initial: 0 }),
            // Costs X hp
            sacrifice: new fields.NumberField({ nullable: false, integer: true, min: true, initial: 0 }),
            // Costs heroics
            heroics: new fields.BooleanField({ initial: false }),
            // Costs aether
            infuse: new fields.NumberField({ nullable: false, integer: true, min: 0, initial: 0 }),
            // Costs blessings on target
            blessings: new fields.NumberField({ nullable: false, integer: true, min: 0, initial: 0 }),

        }, options);
    }

    initialize(value, model, options={}) {
        let rv = super.initialize(value, model, options);
        // Add in a derived helper
        return rv;
    }
}

/** For talents and masteries. WIP */
export class AbilityAugmentationField extends fields.SchemaField {
    constructor(options = {}) {
        super({
            text: new fields.HTMLField()
        }, options);
    }
}

export class AbilityModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            // Choices inherent to an abilities
            choices: new fields.ArrayField(new AbilityChoiceField()),

            // Upgrades for player abilities
            talents: new fields.ArrayField(new AbilityAugmentationField()),
            mastery: new AbilityAugmentationField({ nullable: true })
        };
    }

    static convertSWB(data) {
        data.type = "ability";
        /** @type {string} */
        let name = data.name;

        // Establish some values. SWB values code abilities one at a time
        let dc = {}; // Short for default choice
        data.system.choices = [dc];

        // Extract the subcomponents from the name
        let parenthetical_regex = /\((.*?)\)/;
        let parts = name.match(parenthetical_regex)?.[1]?.split(",") ?? [];
        name = name.replace(parenthetical_regex, "");
        for (let part of parts) {
            const action_match = part.match(/(\d)\s+actions?/i);
            if (action_match) {
                dc.actions = Number.parseInt(action_match[1]);
            }

            const resolve_match = part.match(/(\d)\s+resolve?/i);
            if (resolve_match) {
                dc.resolve = Number.parseInt(resolve_match[1]);
            }

            const interrupt_match = part.match(/(\d)\s+interrupt?/i);
            if (interrupt_match) {
                dc.interrupt = Number.parseInt(interrupt_match[1]);
            }

            const true_strike_match = part.match(/true strike/i);
            if (true_strike_match) {
                dc = true;
            }

            let combo_match = part.match(/combo (\d)/i);
            if (combo_match) {
                dc.combo = combo_match[1] == "1" ? 1 : -1;
            }

            let range_match = part.match(/(Range|Arc|Line) (\d)+/);
            if (range_match) {
                dc.range = range_match[0];
            }
        }

        // Remove empty parens from the name & re-assign
        name = name.replaceAll(/\([ ,]*\)/g, "");
        name = name.trim();
        data.name = name;

        // Extract talents
        data.system.talents = [];
        data.system.mastery = null;
        for (let talent_val of Object.values(data.system.attributes?.Talents)) {
            // talent_key tends to be something akin to Talent1
            if (talent_val.value?.includes("Mastery")) {
                data.system.mastery = {
                    text: talent_val.value
                };
            } else if (talent_val.value?.trim()) {
                data.system.talents.push({
                    text: talent_val.value
                });
            }
        }
    }
}
