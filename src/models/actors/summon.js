import { ActorModel } from "./actor";

export class SummonModel extends ActorModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),

            // Does this summon count as an object
            is_object: new foundry.data.fields.BooleanField({initial: false}),
            tags: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField()),
            // Ongoing, persistent effects
            summon_effects: new foundry.data.fields.HTMLField(),
            // Effects when summoned and on the summoners turn
            summon_actions: new foundry.data.fields.HTMLField(),
        };
    }


    static convertSWB(data) {
        data.type = "summon";
    }
}
