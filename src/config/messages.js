// Sets up our svelte messages

import { TOKEN_STORES } from "../util/stores";
import AbilityRollMessage from "../view/chat/AbilityRollMessage.svelte";
import HarmManifestMessage from "../view/chat/HarmManifestMessage.svelte";
import NarrativeRollMessage from "../view/chat/NarrativeRollMessage.svelte";

export class SvelteChatLog extends ChatLog {
    // Alter update behavior so it updates props instead
    updateMessage(msg, notify=false) {
        if(msg._svelteComponent) {
            // Get probably updated flags, and send them to the message svelte component
            let flagData = msg.getFlag(game.system.id, 'data');
            flagData = foundry.utils.duplicate(flagData);
            delete flagData["type"];
            const tokens = flagData.tokens;
            delete flagData["tokens"];
            msg._svelteComponent.$$set(flagData);

            // Update token stores
            TOKEN_STORES.get(msg.id).set(tokens ?? {});
        } else {
            super.updateMessage(msg, notify);
        }
    }
}

/**
 *
 */
export function setupMessages() {
    // Sets up our svelte components on messages
    const sveltifyMessage = async (msg, html) => {
        // Find associated flag data scoped to your module ID. This is the easiest way to determine that this message is
        // associated with your module and has a Svelte component attached to the message content.
        let flagData = msg.getFlag(game.system.id, 'data');

        if (typeof flagData === 'object') {
            // Fixup flag data
            flagData = foundry.utils.duplicate(flagData);
            const type = flagData.type;
            const tokens = flagData.tokens;
            delete flagData["type"];
            delete flagData["tokens"];

            // Form props and target
            const props = { msg, ...flagData };
            const target = html[0];

            // Add the svelte component to the message instance loaded in client side memory.
            if (type === "ability") {
                msg._svelteComponent = new AbilityRollMessage({ target, props });
            } else if (type == "narrative") {
                msg._svelteComponent = new NarrativeRollMessage({ target, props })
            } else if (type == "harm") {
                msg._svelteComponent = new HarmManifestMessage({ target, props })
            }

            // Update token stores
            TOKEN_STORES.get(msg.id).set(tokens ?? {});

            // Scroll chat log to bottom.
            setTimeout(() => ui.chat.scrollBottom(), 20);
        }

    };

    // Create a svelte component when rendering new chat components
    Hooks.on("renderChatMessage", sveltifyMessage);

    // Iterate over all existing chat message documents and add svelte components
    for (const message of game.messages) {
        const el = document.querySelector(`.message[data-message-id="${message.id}"] .message-content`);
        sveltifyMessage(message, [el]);
    }

    // Clean up / destroy the mounted Svelte component to the message instance when the chat message is deleted.
    Hooks.on('preDeleteChatMessage', (message) => {
        // Find associated flag data scoped to your module ID. This is the easiest way to determine that this message is
        // associated with your module and has a Svelte component attached to the message content.
        const flagData = message.getFlag(game.system.id, 'data');

        // Also ensure that the Svelte component exists
        if (typeof flagData === 'object' && typeof message?._svelteComponent?.$destroy === 'function') {
            // Manually destroy Svelte component when the chat message document is being deleted.
            message._svelteComponent.$destroy();
        }
    });

    setTimeout(() => ui.chat.scrollBottom(), 500);
}