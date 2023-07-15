import { ClockField, FakeBoundedNumberField } from "../base";
import { ActorModel } from "./actor";

const fields = foundry.data.fields;

const actionField = () => new fields.NumberField({ nullable: false, integer: true, min: 0, max: 4, initial: 0 });

export class PlayerModel extends ActorModel {
    static defineSchema() {
        return {
            // Non combat
            kin: new fields.StringField({initial: "Arken"}),
            culture: new fields.StringField({initial: "Arken"}),
            bond: new fields.StringField({initial: "Arkenlord"}), // Eventually will be item
            effort: new FakeBoundedNumberField({ min: 0, max: 3, initial: 0 }),
            strain: new FakeBoundedNumberField({ min: 0, max: 5, initial: 0 }),
            burdens: new fields.SchemaField({
                c4: new ClockField({ size: 4 }),
                c6: new ClockField({ size: 6 }),
                c8: new ClockField({ size: 8 })
            }),
            ambitions: new fields.SchemaField({
                c4: new ClockField({ size: 4 }),
                c6: new ClockField({ size: 6 }),
                c10: new ClockField({ size: 10 })
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
            xp_tracker: new fields.SchemaField({
                ideals: new ClockField({ size: 2 }),
                challenged: new ClockField({ size: 2 }),
                ambition: new ClockField({ size: 3 }),
                burdens: new ClockField({ size: 1 })
            }),

            // Combat
            hp: new FakeBoundedNumberField(),
            wounds: new FakeBoundedNumberField(),
            level: new fields.StringField({initial: "Arken"}), // Eventually will be item
            class: new fields.StringField({initial: "Stalward"}), // Eventually will be item
            job: new fields.StringField({initial: "Knave"}), // Eventually will be item
        };
    }

    prepareBaseData() {
        this.ideals = [];
    }

    prepareDerivedData() {
        console.log(this);
    }
    
    static convertSWB(data) {
        data.type = "player";
        let old_sys = data.system;
        let new_sys = {};
        data.system = new_sys;

        // Convert "state"
        new_sys.hp = old_sys.health.value;
        new_sys.strain = old_sys.strain.value;
        new_sys.effort = old_sys.strain.value;
        
        // Convert skills
        new_sys.actions = {};
        for (let [skill_name, skill_data] of Object.entries(old_sys.attributes?.skills ?? {})) {
            new_sys.actions[skill_name.toLowerCase()] = skill_data.value ?? 0;
        }

        // Convert clocks
        new_sys.ambitions = {
            c4: {},
            c6: {},
            c10: {}
        };
        new_sys.burdens = {
            c4: {},
            c6: {},
            c8: {}
        };
        for (let [clock_name, clock_data] of Object.entries(old_sys.attributes?.clocks ?? {})) {
            let [number] = clock_name.match(/d+/) ?? [0];
            let is_name = clock_name.includes("Name");
            if (clock_name.startsWith("Ambition")) {
                let target_clock = new_sys.ambitions[`c${number}`];
                if (target_clock && is_name) {
target_clock.name = clock_data.value;
}
                if (target_clock && !is_name) {
target_clock.value = clock_data.value;
}
            } else if (clock_name.startsWith("Burden")) {
                let target_clock = new_sys.burdens[`c${number}`];
                if (target_clock && is_name) {
target_clock.name = clock_data.value;
}
                if (target_clock && !is_name) {
target_clock.value = clock_data.value;
}
            }
        }
    }
}
