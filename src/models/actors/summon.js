import { ActorModel } from "./actor";

export class SummonModel extends ActorModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new foundry.data.fields.HTMLField(),
        }
    }
}
