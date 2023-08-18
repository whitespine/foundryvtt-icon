import { ICON } from "../consts";
import { AbilityModel } from "../models/items/ability";
import { BondPowerModel } from "../models/items/bond_power";

/**
 * Our custom class for Icon Items
 */
export class IconItem extends Item {
    /** Patch update to preserve arrays */
    async update(data, options = {}) {
        data = this.system.fullUpdateData(data);
        return super.update(data, options);
    }

}