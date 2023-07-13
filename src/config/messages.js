// Sets up our svelte messages

import AttackRollMessage from "../view/chat/AttackRollMessage.svelte";

/**
 *
 */
export function setupMessages() {
    // Sets up our svelte components on messages
    const sveltifyMessage = async (msg, html) => {
        // Find associated flag data scoped to your module ID. This is the easiest way to determine that this message is
        // associated with your module and has a Svelte component attached to the message content.
        const flagData = msg.getFlag(game.system.id, 'data');

        if (typeof flagData === 'object') {
            // Add the svelte component to the message instance loaded in client side memory.
            const type = flagData["type"];
            const props = foundry.utils.mergeObject({ msg }, flagData);
            const target = html[0];
            if (type === "attack") {
                msg._svelteComponent = new AttackRollMessage({ target, props });
            }
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

    // Scroll chat log to bottom.
    ui.chat.scrollBottom();
}