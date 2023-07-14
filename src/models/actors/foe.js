import { ClockField } from "../base";
import { ActorModel } from "./actor";

export class FoeModel extends ActorModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            biography: new foundry.data.fields.HTMLField(),
            clocks: new foundry.data.fields.ArrayField(new ClockField())

            // For legends
        }
    }
}
