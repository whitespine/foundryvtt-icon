import { CastingStringField, ControlledLengthArrayField, FakeBoundedNumberField } from "../base";
import { ItemModel } from "./item";


export class RelicModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new foundry.data.fields.HTMLField(),
            ranks: new ControlledLengthArrayField(new foundry.data.fields.SchemaField({
                // the raw text of the relic
                text: new foundry.data.fields.HTMLField(),

                // If an attack roll is this or higher, you may trigger this invoke effects. -1 => None
                attack_invoke: new foundry.data.fields.NumberField({ nullable: false, integer: true, min: -1, max: 20, initial: -1 }),

                // True iff this has an invokable gambit
                gambit: new foundry.data.fields.BooleanField({ initial: false }),

                // Helper to track if the gambit has been used this combat
                gambit_used: new foundry.data.fields.BooleanField({ initial: false }),

                // At this round or higher, active. -1 => off
                round_invoke: new foundry.data.fields.NumberField({ nullable: false, integer: true, min: -1, max: 20, initial: -1 }),
            }), { length: 4 }),
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
    
    static migrateData(data) {
        // We made ranks slightly more complex over time
        if(data.ranks) {
            data.ranks = data.ranks.map(possibly_string => {
                if(typeof possibly_string === "string") {
                    return {
                        text: possibly_string
                    };
                } else {
                    return possibly_string;
                }
            })
        }

    }
}
