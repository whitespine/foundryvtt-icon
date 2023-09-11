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
            effort: new FakeBoundedNumberField({ min: 0, initial: 0 }),
            strain: new FakeBoundedNumberField({ min: 0, initial: 0 }),
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
            xp: new FakeBoundedNumberField({ max: 15, no_upper_bound: true }),
            dust: new FakeBoundedNumberField({ max: 8 }),
            xp_tracker: new fields.SchemaField({
                ideals: new ClockField({ size: 2 }),
                challenges: new ClockField({ size: 2 }),
                ambitions: new ClockField({ size: 3 }),
                burdens: new ClockField({ size: 1 })
            }),
            level_choices: new fields.SchemaField({
                four: new fields.SchemaField({
                    combat: new fields.StringField({ choices: ["job", "mastery"], initial: "job" }),
                    narrative: new fields.StringField({ choices: ["actions", "power"], initial: "actions" }),
                }),
                eight: new fields.SchemaField({
                    combat: new fields.StringField({ choices: ["job", "mastery"], initial: "job" }),
                    narrative: new fields.StringField({ choices: ["actions", "power"], initial: "actions" }),
                }),
            }),

            // Combat
            hp: new FakeBoundedNumberField({ nullable: false, initial: 0, min: 0 }),
            vigor: new FakeBoundedNumberField({ nullable: false, initial: 0, min: 0, no_upper_bound: true }),
            wounds: new FakeBoundedNumberField({ nullable: false, initial: 0, min: 0, max: 4 }),
            aether: new fields.NumberField({ nullable: false, initial: 0, min: 0, max: 999 }),
            resolve: new fields.NumberField({ nullable: false, initial: 0, min: 0, max: 999 }), // Personal resolve
            combo: new fields.BooleanField({ initial: false }), // Combo token
            level: new fields.NumberField({ nullable: false, min: 0, max: 9, initial: 0 }),
        };
    }

    prepareBaseData() {
    }

    prepareDerivedData() {
        // /////////////// Narrative:
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
        this.bond = this.parent.items.find((i) => i.type === "bond");
        this.strain.max = this.bond?.system.strain_cap ?? 5;
        this.effort.max = this.bond?.system.effort_cap ?? 3;

        // /////////////// Progression:
        // Compute total points
        // ap = Ability Points - Can be spent on abilities OR talents
        // sap = Static AP - Can only be spent on abilities
        // mp = Mastery Points - Can be spent on masteries
        // jp = Job Points - Can be spent on jobs
        // rp = Relic Points - How many relics you should have
        // bp = Bond Points - How many bond powers you should have
        // nap = Narrative Action Points - How many action pips you should have
        // --- Validation
        // ability_count = Total # of abilities. Should be >= sap
        // ap_count = ability_count + total # of talents. Should be == sap + ap
        // mastery_count = Total # of masteries. Should be == smp.
        // job_count = Total # of jobs. Should be == jp
        // relic_count = Total # of relics. Should be == rp
        // action_count = Total # of action pips. Should be == nap
        // bond_power_count = Total # of bond powers. Should be == bp

        let budget = {
            sap: 2, // Base for level zero
            ap: 0,
            mp: 0,
            rp: 0,
            jp: 0,
            bp: 1, // Base for level zero
            nap: 6 // Base for level zero
        };
        let spending = {
            ability_count: 0,
            ap_count: 0,
            mastery_count: 0,
            job_count: 0,
            relic_count: 0,
            action_count: 0,
            bond_power_count: 0
        };
        this.progression = {
            budget,
            spending,
            warnings: []
        };

        // Compute budget
        let lc = this.level_choices;
        switch (this.level) {
            case 12:
                budget.mp++;
                budget.bp++;
            case 11:
                budget.ap++;
                budget.nap++;
            case 10:
                budget.mp++;
                budget.nap++;
            case 9:
                budget.rp++;
                budget.nap++;
            case 8:
                if (lc?.eight?.combat === "job") {
                    budget.jp++;
                } else if (lc?.eight?.combat === "mastery") {
                    budget.mp++;
                }
                if (lc?.eight?.narrative === "actions") {
                    budget.nap += 2;
                } else if (lc?.eight?.narrative === "power") {
                    budget.bp++;
                }
            case 7:
                budget.mp++;
                budget.nap++;
            case 6:
                budget.rp++;
                budget.bp++;
            case 5:
                budget.ap++;
                budget.nap++;
            case 4:
                if (lc?.four?.combat === "job") {
                    budget.jp++;
                } else if (lc?.four?.combat === "mastery") {
                    budget.mp++;
                }
                if (lc?.four?.narrative === "actions") {
                    budget.nap += 2;
                } else if (lc?.four?.narrative === "power") {
                    budget.bp++;
                }
            case 3:
                budget.mp++;
                budget.bp++;
            case 2:
                budget.rp++;
                budget.bp++;
                budget.nap++;
            case 1:
                budget.ap += 2; 
                budget.bp++;
                budget.nap++;
                budget.jp++;
        }

        // Adjust by prior and current half-level ap increments
        if (this.level >= 1) {
            // According to pg 115 of 1.5, you technically get the half-level AP from 0
            budget.ap += this.level; // All previous half increments
            if (this.xp.value >= 7) {
                budget.ap += 1; // This level half increment
            }
        }

        // Compute spending
        let jobs = this.parent.items.filter((i) => i.type === "job");
        let bond_powers = this.parent.items.filter((i) => i.type === "bond-power");
        let abilities = this.parent.items.filter((i) => i.type === "ability" && !i.system.trait);
        let relics = this.parent.items.filter((i) => i.type === "relic");
        let talent_count = abilities.filter((a) => a.system.talents.some((t) => t.unlocked)).length;
        let mastery_count = abilities.filter((a) => a.system.mastery.unlocked).length;
        let narrative_action_count = Object.values(this.actions).reduce((a, b) => a + b, 0);

        // First bespoke
        if (abilities.length < budget.sap) {
            this.progression.warnings.push("You have too few abilities unlocked!");
        }

        const adjudicate = (expected, actual, name) => {
            if (expected != actual) {
this.progression.warnings.push(`Invalid number of ${name}. Expected ${expected}, found ${actual}`);
}
        };
        adjudicate(budget.ap + budget.sap, abilities.length + talent_count, "Abilities + Talents unlocked");
        adjudicate(budget.mp, mastery_count, "Masteries");
        adjudicate(budget.jp, jobs.length, "Jobs");
        adjudicate(budget.rp, relics.length, "Relics");
        adjudicate(budget.nap, narrative_action_count, "Action Points");
        adjudicate(budget.bp, bond_powers.length, "Bond Powers");


        // /////////////// Combat:
        // Grab key data, setup class, setup hp, etc
        this.job = jobs[0];
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
}
