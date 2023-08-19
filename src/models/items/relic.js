import { CastingStringField, ControlledLengthArrayField, FakeBoundedNumberField } from "../base";
import { ItemModel } from "./item";


export class RelicModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new foundry.data.fields.HTMLField(),
            ranks: new ControlledLengthArrayField(new foundry.data.fields.HTMLField(), { length: 4 }),
            rank: new FakeBoundedNumberField({ nullable: false, min: 1, max: 4, initial: 1 }),
            infused_dust: new FakeBoundedNumberField(),
            aspect_quest: new foundry.data.fields.HTMLField()
        };
    }

    prepareDerivedData() {
        // Set infusion max
        if (this.rank.value === 3) {
            this.infused_dust.max = 12;
        } else if (this.rank.value === 4) {
            this.infused_dust.max = 0;
        } else {
            this.infused_dust.max = 6;
        }
    }
}
