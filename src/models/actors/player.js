import { ClockField, FakeBoundedNumberField } from "../base";
import { ActorModel } from "./actor";

const fields = foundry.data.fields;

const actionField = () => new fields.NumberField({ nullable: false, integer: true, min: 0, max: 4, initial: 0 });
const actionPenaltyField = () => new fields.NumberField({ nullable: false, integer: true, min: 0, max: 4, initial: 0 });

export class PlayerModel extends ActorModel {
    static defineSchema() {
        return {
            player_name: new fields.StringField(),
            // Non combat
            kin: new fields.StringField({ initial: "Arken" }),
            culture: new fields.StringField({ initial: "Arken" }),
            bond: new fields.StringField({ initial: "Arkenlord" }), // Eventually will be item
            effort: new FakeBoundedNumberField({ min: 0, max: 3, initial: 0 }),
            strain: new FakeBoundedNumberField({ min: 0, max: 5, initial: 0 }),
            burdens: new fields.SchemaField({
                c4: new ClockField({ size: 4 }, { initial: () => ({ name: "4 Burden" }) }),
                c6: new ClockField({ size: 6 }, { initial: () => ({ name: "6 Burden" }) }),
                c8: new ClockField({ size: 8 }, { initial: () => ({ name: "8 Burden" }) })
            }),
            ambitions: new fields.SchemaField({
                c4: new ClockField({ size: 4 }, { initial: () => ({ name: "4 Ambition" }) }),
                c6: new ClockField({ size: 6 }, { initial: () => ({ name: "6 Ambition" }) }),
                c10: new ClockField({ size: 10 }, { initial: () => ({ name: "10 Ambition" }) })
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
            action_penalties: new fields.SchemaField({
                sneak: actionPenaltyField(),
                traverse: actionPenaltyField(),
                sense: actionPenaltyField(),
                study: actionPenaltyField(),
                charm: actionPenaltyField(),
                command: actionPenaltyField(),
                tinker: actionPenaltyField(),
                excel: actionPenaltyField(),
                smash: actionPenaltyField(),
                endure: actionPenaltyField(),
            }),
            xp: new FakeBoundedNumberField({ max: 15 }),
            dust: new FakeBoundedNumberField({ max: 8 }),
            xp_tracker: new fields.SchemaField({
                ideals: new ClockField({ size: 2 }),
                challenged: new ClockField({ size: 2 }),
                ambition: new ClockField({ size: 3 }),
                burdens: new ClockField({ size: 1 })
            }),

            // Combat
            hp: new FakeBoundedNumberField({ nullable: false, initial: 0, min: 0 }),
            vigor: new FakeBoundedNumberField({ nullable: false, initial: 0, min: 0 }),
            wounds: new FakeBoundedNumberField({ nullable: false, initial: 0, min: 0, max: 4 }),
            aether: new fields.NumberField({ nullable: false, initial: 0, min: 0, max: 999 }),
            level: new fields.NumberField({ nullable: false, min: 0, max: 9, initial: 0 }), // Eventually will be item
            class: new fields.StringField({ initial: "Stalwart" }), // Eventually will be item
            job: new fields.StringField({ initial: "Knave" }), // Eventually will be item
        };
    }

    prepareBaseData() {
    }

    prepareDerivedData() {
        ///////////////// Narrative:
        // Initialize sane defaults in absence of hard-set values
        for (let [k, v] of Object.entries(this.burdens)) {
            if (this._source.burdens[k].name === `New ${k[1]} Clock`) {
                this._source.burdens[k].name = `${v.size} Burden`;
            }
        }
        for (let [k, v] of Object.entries(this.ambitions)) {
            if (this._source.ambitions[k].name === `New ${k[1]} Clock`) {
                this._source.ambitions[k].name = `${v.size} Ambition`;
            }
        }
        this.bond = this.parent.items.find(i => i.type === "bond");

        ///////////////// Combat:
        // Grab key data
        this.job = this.parent.items.find(i => i.type === "job");
        if (this.job) {
            this.class = this.job.system.class; // Alias for ease of access
            // Set max hp & fill hp if none set
            this.hp.max = this.class.vitality * (4 - this.wounds.value);
            if (this._source.hp === null) {
                this.hp.value = this.hp.max;
            }

            // Set max vigor based on vitality
            this.vigor.max = this.class.vitality;

            // Set true max hp
            this.true_max_hp = this.class.vitality * 4;
            this.bloodied = this.hp.value <= this.class.vitality * 2;
        } else {
            this.job = null;
            this.class = null;
            this.current_max_hp = 0;
        }
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
