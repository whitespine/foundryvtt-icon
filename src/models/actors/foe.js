import { ClockField } from "../base";
import { ActorModel } from "./actor";

export class FoeModel extends ActorModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),

            // Tactics and description
            description: new foundry.data.fields.HTMLField(),
            setup: new foundry.data.fields.ArrayField(new foundry.data.fields.HTMLField()),

            // Metadata
            chapter: new foundry.data.fields.NumberField({nullable: false, integer: true, initial: 1, min: 1, max: 3}),
            class_name: new foundry.data.fields.StringField({initial: "Unknown Class"}),

            // Stats are just built into a foe
            vitality: new foundry.data.fields.NumberField({nullable: false, integer: true, initial: 0, min: 0}),
            speed: new foundry.data.fields.NumberField({nullable: false, integer: true, initial: 0, min: 0}),
            defense: new foundry.data.fields.NumberField({nullable: false, integer: true, initial: 0, min: 0}),
            fray_damage: new foundry.data.fields.NumberField({nullable: false, integer: true, initial: 1, min: 0}),
            damage_die: new foundry.data.fields.NumberField({nullable: false, integer: true, initial: 6, min: 4}),
            hp_multiplier: new foundry.data.fields.NumberField({nullable: false, integer: true, initial: 4, min: 1}),

            // Misc
            clocks: new foundry.data.fields.ArrayField(new ClockField())

            // For legends
        };
    }

    static convertSWB(data) {
        data.type = "foe";
    }
}
