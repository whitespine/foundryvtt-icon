
/**
 * Our custom class for Icon Items
 */
export class IconItem extends Item {



    /** 
     * @override 
     * Fixup types in-flight to allow compendium compatibility
    */
    static migrateData(data) {
        if(data.type == "item") {
            // Need to fixup a SWB item
            console.warn("Migrating SWB", foundry.utils.duplicate(data));
            if(data.name.toLowerCase().includes("action")) {
                data.type = "foe-action";
            } else {
                data.type = "junk";
            }
        }
        return super.migrateData(data);
    }
}