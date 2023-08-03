import { ICON } from "../consts";
import { AbilityModel } from "../models/items/ability";
import { BondPowerModel } from "../models/items/bond_power";
import { TraitModel } from "../models/items/trait";

/**
 * Our custom class for Icon Items
 */
export class IconItem extends Item {
    /** Patch update to preserve arrays */
    async update(data, options = {}) {
        data = this.system.fullUpdateData(data);
        return super.update(data, options);
    }

    static migrateData(data) {
        // Fixup types in-flight to allow compendium compatibility
        if (data.type == "item") {
            // Need to fixup a SWB item
            console.warn("Migrating SWB", foundry.utils.duplicate(data));
            let ntlc = data.name.toLowerCase();
            if (data.flags.icon_data?.isTrait) {
                // Flags confirm
                TraitModel.convertSWB(data);
            } else if (data.flags.icon_data?.isBondPower) {
                // Flags confirm
                BondPowerModel.convertSWB(data);
            } else if (ntlc.includes("action") || ntlc.includes("interrupt")) {
                // It's probably an ability, pretty sure!
                AbilityModel.convertSWB(data);
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