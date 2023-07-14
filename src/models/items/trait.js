import { ItemModel } from "./item";

export class TraitModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new foundry.data.fields.HTMLField(),
        };
    }

    static convertSWB(data) {
        data.type = "trait";
    }
}
