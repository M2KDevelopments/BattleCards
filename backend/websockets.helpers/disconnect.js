import { Socket } from "socket.io"

/**
 * Send message to Front End - socket.io callback will trigger the callback on the frontend
 * @param {Socket} socket
 * @returns 
 */
export function onDisconnect(socket) {
    return () => {
        console.log("Disconnected", socket.id)
        socket.broadcast.emit('ondisconnected', socket.id)
    }
}