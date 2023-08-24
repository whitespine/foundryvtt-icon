// Adds glossary definitions to status flags
export function enhanceStatuses() {
    let effects = game.i18n.translations.ICON.Effects;
    let statuses = game.i18n.translations.ICON.Statuses;
    let glossary = game.i18n.translations.ICON.Glossary;
    CONFIG.statusEffects.forEach(v => {
        let description = effects[v.name] || statuses[v.name] || glossary[v.name];
        v.flags = {
            [game.system.id]: {
                "description": description
            }
        }
    });
}

Hooks.on("dropCanvasData", (canvas, data) => {
    if(data.type !== "Effect") return;
    // Find a target
    const targets = canvas.tokens.placeables.filter(token => {
        if (!token.visible) return false;
        return Number.between(data.x, token.bounds.x, token.bounds.x + token.bounds.width)
            && Number.between(data.y, token.bounds.y, token.bounds.y + token.bounds.height);
    });

    if(targets.length) {
        let target = targets[0];
        target.actor.createEmbeddedDocuments("ActiveEffect", [data]);
    }
});