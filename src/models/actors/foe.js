import { ClockField, FakeBoundedNumberField } from "../base";
import { ClassField } from "../items/job";
import { ActorModel } from "./actor";

export class ConditionsField extends foundry.data.fields.SchemaField {
    constructor(options={}) {
        super({
            // Disable unless is this special class type (legend, etc)
            is_type: new foundry.data.fields.StringField({nullable: true, initial: null}),
            // Disable unless isnt this special class type (legend, etc)
            isnt_type: new foundry.data.fields.StringField({nullable: true, initial: null}),
            // Disable unless above this chapter
            above_chapter: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField()),
            // Disable unless below this chapter
            below_chapter: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField()),
        }, options);
    }
}


export class FoeModel extends ActorModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),

            // Tactics and description
            description: new foundry.data.fields.HTMLField(),
            setup: new foundry.data.fields.HTMLField(),

            // Metadata
            chapter: new foundry.data.fields.NumberField({nullable: false, integer: true, initial: 1, min: 1, max: 3}),
            template: new foundry.data.fields.StringField({initial: "Normal", choices: [
                "Normal",
                "Elite",
                "Mob",
                "Legend",
            ]}),
            faction: new foundry.data.fields.StringField({initial: "Folk"}),

            // Class is built directly into the foe
            class: new ClassField(),
            hp_multiplier: new foundry.data.fields.NumberField({ nullable: false, integer: true, initial: 4, min: 1 }),

            // Mutable stats:
            hp: new FakeBoundedNumberField(),
            vigor: new FakeBoundedNumberField(),
            activations: new FakeBoundedNumberField(),

            // Misc
            clocks: new foundry.data.fields.ArrayField(new ClockField())

            // For legends
        };
    }

    prepareDerivedData() {
        // Initialize our fields
        this.hp.max = this.class.vitality * this.hp_multiplier;
        if(this._source.hp === null) {
            this.hp.value = this.hp.max;
        }
        this.vigor.max = this.class.vitality;
    }

    static convertSWB(data) {
        data.type = "foe";
    }
}
