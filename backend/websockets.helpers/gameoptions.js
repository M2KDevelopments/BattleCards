import { Socket } from "socket.io"


/**
 * When a socket joins room 
 * @param {Socket} socket
 * @returns 
 */
export function onGameOptions(socket) {
    return (data, callback) => {
        socket.to(data.roomId).emit("ongameoptions", data)
        callback(data);
    }
}