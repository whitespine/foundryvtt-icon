import { ClockField } from "../base";
import { ActorModel } from "./actor";

export class FoeModel extends ActorModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            clocks: new foundry.data.fields.ArrayField(new ClockField())

            // For legends
        };
    }

    static convertSWB(data) {
        data.type = "foe";
    }
}
