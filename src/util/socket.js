let my_socket;

Hooks.once("socketlib.ready", () => {
	my_socket = socketlib.registerSystem(game.system.id);
	my_socket.register("update-message", updateMessageInner);
});


/**
 *
 * @param id
 *
 * @param data
 */
function updateMessageInner(id, data) {
    let msg = game.messages.get(id);
    if (msg) {
        msg.update(data);
    }
}

/**
 * Allows for updating any message so long as a GM is online
 * 
 * @param {ChatMessage} message 
 *
 * @param {any} data Update data
 */
export async function adminUpdateMessage(message, data) {
    await my_socket.executeAsGM("update-message", message.id, data);
}