import { FoeModel } from "../models/actors/foe";
import { PlayerModel } from "../models/actors/player";
import { JobModel } from "../models/items/job";

/**
 * Configure all of our system documents
 */
export function setupModels() {
    // Setup models
    CONFIG.Item.systemDataModels["job"] = JobModel;
    CONFIG.Actor.systemDataModels["player"] = PlayerModel;
    CONFIG.Actor.systemDataModels["foe"] = FoeModel;
}