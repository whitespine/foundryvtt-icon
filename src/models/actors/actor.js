import { IconDataModel } from "../base";

export class ActorModel extends IconDataModel {
    // Some schema elements are consistent across all actor types. Define them here
    static defineSchema() {
        return {
            activations: new foundry.data.fields.NumberField({ nullable: false, integer: true, min: 0, initial: 1 }),
            biography: new foundry.data.fields.HTMLField(),
        };
    }


    prepareDerivedData() {
        // Initialize our fields
        console.log(this);
    }
}