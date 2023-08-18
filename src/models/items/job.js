import { CastingStringField } from "../base";
import { ItemModel } from "./item";

// For other's reference
export const GENERIC_COLORS = ["Red", "Yellow", "Blue", "Green", "Special"];
export const FOE_COLORS = ["Heavy", "Skirmisher", "Artillery", "Leader", "Special"];
export const PLAYER_COLORS = ["Stalwart", "Vagabond", "Wright", "Mendicant", "Special"];


export const COLOR_FIELD = () => new CastingStringField({
    initial: "Special",
    choices: [
        "Red",
        "Yellow",
        "Blue",
        "Green",
        "Special"
    ],
    cast: (s) => {
        let remapped = {
            red: "Red",
            heavy: "Red",
            stalwart: "Red",

            yellow: "Yellow",
            skirmisher: "Yellow",
            vagabond: "Yellow",

            blue: "Blue",
            artillery: "Blue",
            wright: "Blue",

            green: "Green",
            leader: "Green",
            mendicant: "Green",
        }[s.toLowerCase()] || "Special";
        return remapped;
    }
});
export class ClassField extends foundry.data.fields.SchemaField {
    constructor(options = {}) {
        super({
            color: COLOR_FIELD(),
            vitality: new foundry.data.fields.NumberField({ nullable: false, integer: true, initial: 0, min: 0 }),
            speed: new foundry.data.fields.NumberField({ nullable: false, integer: true, initial: 4, min: 0 }),
            dash: new foundry.data.fields.NumberField({ nullable: false, integer: true, initial: 2, min: 0 }),
            defense: new foundry.data.fields.NumberField({ nullable: false, integer: true, initial: 0, min: 0 }),
            fray_damage: new foundry.data.fields.NumberField({ nullable: false, integer: true, initial: 1, min: 0 }),
            damage_die: new foundry.data.fields.NumberField({ nullable: false, integer: true, initial: 6, min: 4 }),
        }, options);
    }

    // Populate some extra fields
    initialize(value, model, options = {}) {
        let rv = super.initialize(value, model, options);
        let name_index = GENERIC_COLORS.indexOf(rv.color);
        rv.player_class_name = PLAYER_COLORS[name_index];
        rv.foe_class_name = FOE_COLORS[name_index];

        return rv;
    }
};

export class JobModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new foundry.data.fields.HTMLField(),

            // We just build these directly into jobs
            class: new ClassField(),

            // Abilities
            // An array of compendium uuids of unlockable abilities
            // Ideally you don't edit this, and only show it when in a special unlock menu
            abilities: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField()),
        };
    }
}
