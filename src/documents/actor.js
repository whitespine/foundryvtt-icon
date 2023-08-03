import { ICON } from "../consts";
import { FoeModel } from "../models/actors/foe";
import { PlayerModel } from "../models/actors/player";
import { SummonModel } from "../models/actors/summon";

/**
 * Our custom class for Icon Actors
 */
export class IconActor extends Actor {

    /** Patch update to preserve arrays */
    async update(data, options = {}) {
        data = this.system.fullUpdateData(data);
        return super.update(data, options);
    }

    static migrateData(data) {
        if (data.type == "character") {
            // Need to fixup SWB actor
            console.warn("Migrating SWB actor", foundry.utils.duplicate(data));
            if (data.system.health.max === 1) {
                // Summons just tend to be like this. We can adjust this heuristic later
                SummonModel.convertSWB(data);
            } else if (data.items.find((i) => i.name === "Traits")) {
                // Foes are easily recognizable by their signature "Traits" item
                FoeModel.convertSWB(data);
            } else {
                // More than likely!
                PlayerModel.convertSWB(data);
            }
            // Fallback 
            if (data.type === "item") {
                data.type = "junk";
            } else {
                // Flag as converted and needing a commit
                data.flags[game.system.id] ??= {};
                data.flags[game.system.id][ICON.flags.swb_needs_commit] = true;
            }
            console.warn(`Turned it into a ${data.type}!`);
        }
        return super.migrateData(data);
    }
}