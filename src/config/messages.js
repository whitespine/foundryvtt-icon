// Sets up our svelte messages

import AbilityRollMessage from "../view/chat/AbilityRollMessage.svelte";
import HarmManifestMessage from "../view/chat/HarmManifestMessage.svelte";
import NarrativeRollMessage from "../view/chat/NarrativeRollMessage.svelte";

export class SvelteChatLog extends ChatLog {
    // Alter update behavior so it updates props instead
    updateMessage(msg, notify = false) {
        if (!msg._svelteComponent) {
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
        let svelte_msg_type = msg.getFlag(game.system.id, 'svelte_msg_type');

        if (svelte_msg_type) {
            // Form props and target
            const props = { msg };
            const target = html[0];

            // Add the svelte component to the message instance loaded in client side memory.
            if (svelte_msg_type === "ability") {
                msg._svelteComponent = new AbilityRollMessage({ target, props });
            } else if (svelte_msg_type == "narrative") {
                msg._svelteComponent = new NarrativeRollMessage({ target, props })
            } else if (svelte_msg_type == "harm") {
                msg._svelteComponent = new HarmManifestMessage({ target, props })
            }


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
        // Use svelte_msg_type to determine if it likely has a svelte component
        // Also ensure that the Svelte component exists
        if (message.getFlag(game.system.id, 'svelte_msg_type') && typeof message?._svelteComponent?.$destroy === 'function') {
            // Manually destroy Svelte component when the chat message document is being deleted.
            message._svelteComponent.$destroy();
        }
    });

    setTimeout(() => ui.chat.scrollBottom(), 500);
}