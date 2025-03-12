import { Socket } from "socket.io"


/**
 * Send a signal to get games options from host
 * @param {Socket} socket
 * @returns 
 */
export function onGameOptionsFromHost(socket) {
    return (roomId) => {
        // someone else asking
        const host = roomId.includes(socket.id);
        if (!host) socket.to(roomId).emit("ongetgameoptions", {});
    }
}