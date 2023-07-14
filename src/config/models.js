import { FoeModel } from "../models/actors/foe";
import { PlayerModel } from "../models/actors/player";
import { JobModel } from "../models/items/job";

/**
 * Configure all of our system documents
 */
export function setupModels() {
    // Setup models
    CONFIG.Item.dataModels["job"] = JobModel;
    CONFIG.Actor.dataModels["player"] = PlayerModel;
    CONFIG.Actor.dataModels["foe"] = FoeModel;
}