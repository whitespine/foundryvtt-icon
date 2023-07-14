import { ItemModel } from "./item";

export class JobModel extends ItemModel {
    static convertSWB(data) {
        data.type = "job";
    }
}
