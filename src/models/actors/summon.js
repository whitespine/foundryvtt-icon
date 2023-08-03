import { ActorModel } from "./actor";

export class SummonModel extends ActorModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),

            // Does this summon count as an object
            is_object: foundry.data.fields.BooleanField({initial: false}),
            tags: foundry.data.fields.ArrayField(foundry.data.fields.StringField()),
            // Ongoing, persistent effects
            summon_effects: foundry.data.fields.HTMLField(),
            // Effects when summoned and on the summoners turn
            summon_actions: foundry.data.fields.HTMLField(),
        };
    }


    static convertSWB(data) {
        data.type = "summon";
    }
}
