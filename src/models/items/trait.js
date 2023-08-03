import { ItemModel } from "./item";

export class TraitModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new foundry.data.fields.HTMLField(),

            // Minimum chapter it is allowed in
            chapter: new foundry.data.fields.NumberField({ nullable: false, initial: 1, integer: true, min: 1, max: 3}),

            // Special rules for it
            special_requirements: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField()),
        };
    }

    static convertSWB(data) {
        data.type = "trait";
    }
}
