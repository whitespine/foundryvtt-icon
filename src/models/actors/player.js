import { ClockField, FakeBoundedNumberField } from "../base";
import { ActorModel } from "./actor";

const fields = foundry.data.fields;

const actionField = () => new fields.NumberField({ integer: true, min: 0, max: 4, initial: 0 });

export class PlayerModel extends ActorModel {
    static defineSchema() {
        return {
            // Non combat
            kin: new fields.StringField(),
            culture: new fields.StringField(),
            effort: new FakeBoundedNumberField({ min: 0, max: 3 }),
            strain: new FakeBoundedNumberField({ min: 0, max: 5 }),
            burdens: new fields.SchemaField({
                4: new ClockField({ size: 4 }),
                6: new ClockField({ size: 6 }),
                10: new ClockField({ size: 10 })
            }),

            // Kit, gear & ideals come from items (ideals specifically from )

            actions: new fields.SchemaField({
                sneak: actionField(),
                traverse: actionField(),
                sense: actionField(),
                study: actionField(),
                charm: actionField(),
                command: actionField(),
                tinker: actionField(),
                excel: actionField(),
                smash: actionField(),
                endure: actionField(),
            }),
            xp: new ClockField({ size: 15 }),
            xp_tracker: {
                ideals: new ClockField({ size: 2 }),
                challenged: new ClockField({ size: 2 }),
                ambition: new ClockField({ size: 3 }),
                burdens: new ClockField({ size: 1 })
            },

            // Combat
            hp: new FakeBoundedNumberField(),
            wounds: new FakeBoundedNumberField(),
        };
    }

    prepareBaseData() {
        this.ideals = [];
    }

    prepareDerivedData() {
        console.log(this);
    }
}
