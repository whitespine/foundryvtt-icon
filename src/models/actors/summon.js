import { ActorModel } from "./actor";

export class SummonModel extends ActorModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
        };
    }


    static convertSWB(data) {
        data.type = "summon";
    }
}
