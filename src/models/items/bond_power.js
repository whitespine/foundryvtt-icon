import { ItemModel } from "./item";

export class BondPowerModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new foundry.data.fields.HTMLField()
        };
    }
}
