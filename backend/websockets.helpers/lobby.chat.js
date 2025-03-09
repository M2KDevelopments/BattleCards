import { Socket } from "socket.io"

/**
 * Send message to Front End - socket.io callback will trigger the callback on the frontend
 * @param {Socket} socket
 * @returns 
 */
export function onChat(socket) {
    return ({ name, roomId, message }, callback) => {
        const date = Date.now();
        socket.to(roomId).emit("onchat", { chat: { name, message, socketId: socket.id, date } });
        callback({ chat: { name, message, date } });
    }
}