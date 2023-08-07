import { FoeModel } from "../models/actors/foe";
import { PlayerModel } from "../models/actors/player";
import { SummonModel } from "../models/actors/summon";
import { AbilityModel } from "../models/items/ability";
import { BondModel } from "../models/items/bond";
import { BondPowerModel } from "../models/items/bond_power";
import { ItemModel } from "../models/items/item";
import { JobModel } from "../models/items/job";

/**
 * Configure all of our system documents
 */
export function setupModels() {
    // Setup models
    CONFIG.Item.dataModels["junk"] = ItemModel; // Where we send items we don't really care to / know how to render yet
    CONFIG.Item.dataModels["job"] = JobModel;
    CONFIG.Item.dataModels["ability"] = AbilityModel;
    CONFIG.Item.dataModels["bond"] = BondModel;
    CONFIG.Item.dataModels["bond_power"] = BondPowerModel;

    CONFIG.Actor.dataModels["junk"] = ItemModel; // Where we send actors we don't really care to deal with yet
    CONFIG.Actor.dataModels["player"] = PlayerModel;
    CONFIG.Actor.dataModels["foe"] = FoeModel;
    CONFIG.Actor.dataModels["summon"] = SummonModel;
}