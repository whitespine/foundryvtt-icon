// Sets up our svelte messages

import AbilityRollMessage from "../view/chat/AbilityRollMessage.svelte";
import NarrativeRollMessage from "../view/chat/NarrativeRollMessage.svelte";

export class SvelteChatLog extends ChatLog {
    // Alter update behavior so it updates props instead
    updateMessage(message, notify=false) {
        if(message._svelteComponent) {
            // Get probably updated flags, and send them to the message svelte component
            let flagData = message.getFlag(game.system.id, 'data');
            flagData = foundry.utils.duplicate(flagData);
            delete flagData["type"];
            message._svelteComponent.$$set(flagData);
        } else {
            super.updateMessage(message, notify);
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
            delete flagData["type"];

            // Form props and target
            const props = { msg, ...flagData };
            const target = html[0];

            // Add the svelte component to the message instance loaded in client side memory.
            if (type === "attack") {
                msg._svelteComponent = new AbilityRollMessage({ target, props });
            } else if (type == "narrative") {
                msg._svelteComponent = new NarrativeRollMessage({ target, props })
            }

            // Scroll chat log to bottom.
            ui.chat.scrollBottom();
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

}