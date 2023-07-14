import { FoeModel } from "../models/actors/foe";
import { PlayerModel } from "../models/actors/player";
import { SummonModel } from "../models/actors/summon";
import { AbilityModel } from "../models/items/ability";
import { ItemModel } from "../models/items/item";
import { JobModel } from "../models/items/job";
import { TraitModel } from "../models/items/trait";

/**
 * Configure all of our system documents
 */
export function setupModels() {
    // Setup models
    CONFIG.Item.dataModels["junk"] = ItemModel; // Where we send items we don't really care to / know how to render yet
    CONFIG.Item.dataModels["job"] = JobModel;
    CONFIG.Item.dataModels["trait"] = TraitModel;
    CONFIG.Item.dataModels["ability"] = AbilityModel;

    CONFIG.Actor.dataModels["junk"] = ItemModel; // Where we send actors we don't really care to deal with yet
    CONFIG.Actor.dataModels["player"] = PlayerModel;
    CONFIG.Actor.dataModels["foe"] = FoeModel;
    CONFIG.Actor.dataModels["summon"] = SummonModel;
}