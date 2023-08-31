/**
 * Our custom class for Icon Items
 */
export class IconItem extends Item {
    /**
     * Patch update to preserve arrays
     *
     * @param data
     *
     * @param options
     */
    async update(data, options = {}) {
        data = this.system.fullUpdateData(data);
        return super.update(data, options);
    }

}