import { ItemModel } from "./item";

// Represents a single "option" within an ability, e.g. for combo or 
export class ActionField extends foundry.data.fields.SchemaField {
    constructor(options={}) {
        super({
            cost: new foundry.data.fields.SchemaField({
                // Costs
                actions: new foundry.data.fields.NumberField({nullable: false, integer: true, min: 0, max: 2, initial: 1}),
                resolve: new foundry.data.fields.NumberField({nullable: false, integer: true, min: 0, initial: 0}),
                sacrifice: new foundry.data.fields.NumberField({nullable: false, integer: true, min: true}),
            }),

        }, options)
    }
} 

export class AbilityModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),

            // Targeting
            range: new foundry.data.fields.StringField({})

            // Effects
        };
    }

    static convertSWB(data) {
        data.type = "ability";
    }
}
