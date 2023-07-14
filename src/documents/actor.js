
/**
 * Our custom class for Icon Actors
 */
export class IconActor extends Actor {

    /** @override */
    static migrateData(data) {
        if(data.type == "character") {
            // Need to fixup SWB actor
            console.warn("Migrating SWB actor", foundry.utils.duplicate(data));
            if(data.system.health.max === 1) {
                // Summons just tend to be like this. We can adjust this heuristic later
                data.type = "summon";
            } else if(data.items.find(i => i.name === "Traits")) {
                // Foes are easily recognizable by their signature "Traits" item
                data.type = "foe";
            } else {
                // More than likely!
                data.type = "player";
            }
        }
        return super.migrateData(data);
    }
}