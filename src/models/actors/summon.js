import { ActorModel } from "./actor";

export class SummonModel extends ActorModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),

            // Does this summon count as an object
            is_object: foundry.data.fields.BooleanField({initial: false})
        };
    }


    static convertSWB(data) {
        data.type = "summon";
    }
}
