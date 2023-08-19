
export class IconTokenDocument extends TokenDocument {
    // Force editability on all bar attributes
    getBarAttribute(barName, options = {}) {
        let result = super.getBarAttribute(barName, options);
        if (result && !result.editable) {
            result.editable = true;
        }
        return result;
    }
}