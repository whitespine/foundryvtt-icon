import { CastingStringField, FakeBoundedNumberField } from "../base";
import { ItemModel } from "./item";


export class JobModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new foundry.data.fields.HTMLField(),

            rank: new FakeBoundedNumberField({min: 1, max: 4}),
            infused_dust: new FakeBoundedNumberField(),
        };
    }
}
