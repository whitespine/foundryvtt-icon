import { ItemModel } from "./item";

const gear = () => new foundry.data.fields.SchemaField({
    name: new foundry.data.fields.StringField(),
    description: new foundry.data.fields.HTMLField()
});

export class BondModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new foundry.data.fields.HTMLField(),
            ideals: new foundry.data.fields.ArrayField(new foundry.data.fields.HTMLField()),

            // What actions it upgrades
            plus_two_options: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField()),

            // Abilities
            second_wind: new foundry.data.fields.HTMLField(),
            special_ability: new foundry.data.fields.HTMLField(),

            // Straing and effort caps
            strain_cap: new foundry.data.fields.NumberField({ nullable: false, initial: 5, integer: true, min: 0 }),
            effort_cap: new foundry.data.fields.NumberField({ nullable: false, initial: 3, integer: true, min: 0 }),

            // Gear
            primary_gear: gear(),
            secondary_gear: new foundry.data.fields.ArrayField(gear()),
            selected_secondary_gear_index: new foundry.data.fields.NumberField({ nullable: true, initial: null, integer: true }),

            // Powers
            // An array of compendium uuids of unlockable bond powers. 
            // Ideally you don't edit this, and only show it when in a special unlock menu
            powers: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField()),
        };
    }
}
