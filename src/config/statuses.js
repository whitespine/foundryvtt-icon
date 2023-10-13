// Adds glossary definitions to status flags
/**
 *
 */
export function enhanceStatuses() {
    let effects = game.i18n.translations.ICON.Effects;
    let statuses = game.i18n.translations.ICON.Statuses;
    let glossary = game.i18n.translations.ICON.Glossary;
    CONFIG.statusEffects.forEach((v) => {
        v.description = effects[v.name] || statuses[v.name] || glossary[v.name];
    });
}

// Save against an active effect
export async function saveAgainst(...effects) {
    let rolls = [];
    let messages = [];
    for(let effect of effects) {
        let actor = effect.parent;
        if(!(actor instanceof Actor)) {
            throw new Error("Cannot save against a non-owned effect");
        }
        let roll = new Roll("1d20");
        await roll.roll();
        let value = roll.total;
        let message;
            if (value >= 10) {
            await effect.delete();
            message = `${actor.name} saved vs. ${effect.name}: ${roll.toAnchor().outerHTML}!`;
        } else {
            message = `${actor.name} saved vs. ${effect.name}: ${roll.toAnchor().outerHTML}...`;
        }
        messages.push(message);
        rolls.push(roll);
    }
    let content = `<div>
        ${messages.map(m =>`<span>${m}</span>`)}
    </div>`;

    return ChatMessage.create({
        user: game.user.id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        content,
        sound: CONFIG.sounds.dice,
        // rolls
    });
}

Hooks.on("dropCanvasData", (cvs, data) => {
    if (data.type !== "Effect") {
        return;
    }
    // Find a target
    const targets = cvs.tokens.placeables.filter((token) => {
        if (!token.visible) {
            return false;
        }
        return Number.between(data.x, token.bounds.x, token.bounds.x + token.bounds.width) &&
            Number.between(data.y, token.bounds.y, token.bounds.y + token.bounds.height);
    });

    if (targets.length) {
        let target = targets[0];
        target.actor.createEmbeddedDocuments("ActiveEffect", [data]);
    }
});