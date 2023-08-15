let socket;

Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerSystem(game.system.id);
	socket.register("update-message", updateMessageInner);
});


function updateMessageInner(id, data) {
    let msg = game.messages.get(id);
    if(msg) {
        msg.update(data);
    }
}

/** Allows for updating any message so long as a GM is online
 * 
 * @param {ChatMessage} message 
 * @param {any} data Update data
 */
export async function adminUpdateMessage(message, data) {
    await socket.executeAsGM("update-message", message.id, data);
}