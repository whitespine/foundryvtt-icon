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