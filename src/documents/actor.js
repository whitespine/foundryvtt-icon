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
}