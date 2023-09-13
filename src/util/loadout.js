/**
 * Equips a job and all of its traits. Unequips all other traits / jobs
 * 
 * @param {Actor} actor 
 * @param {Item} job 
 */
export async function equipJob(actor, job) {
    // Make all jobs unequipped except the target
    let updates = [];
    let jobs = actor.items.filter(i => i.type === "job");
    for (let other_job of jobs) {
        updates.push({
            _id: other_job._id,
            "system.equipped": other_job === job
        });
    }

    // Handle traits
    let traits = actor.items.filter(i => i.type === "ability" && i.system.trait);
    let missing_traits = await Promise.all(job.system.traits.map(uuid => fromUuid(uuid)));

    // Update existing traits
    for (let trait of traits) {
        let should_be_equipped = missing_traits.some(mt => mt.name === trait.name);
        missing_traits = missing_traits.filter(mt => mt.name != trait.name);
        updates.push({
            _id: trait._id,
            "system.equipped": should_be_equipped
        });
    }

    // Add missing traits
    let new_traits = [];
    for(let mt of missing_traits) {
        new_traits.push(foundry.utils.duplicate(mt.toObject(true)));
    }
    await actor.createEmbeddedDocuments("Item", new_traits);

    // Update all documents
    await actor.updateEmbeddedDocuments("Item", updates);
}

/**
 * Equips a bond... and unequips other bonds... and that's it
 * 
 * @param {Actor} actor 
 * @param {Item} job 
 */
export async function equipBond(actor, bond) {
    // Make all jobs unequipped except the target
    let updates = [];
    let bonds = actor.items.filter(i => i.type === "bond");
    for (let other_bond of bonds) {
        updates.push({
            _id: other_bond._id,
            "system.equipped": other_bond === bond
        });
    }


    await actor.updateEmbeddedDocuments("Item", updates);
}