import { Socket } from "socket.io"


/**
 * When a socket joins room 
 * @param {Socket} socket
 * @returns 
 */
export function onJoin(socket) {
    return async ({ name, roomId }, callback) => {

        // Join the room
        await socket.join(roomId);

        // send to everyone
        socket.to(roomId).emit("onjoin", { name, roomId, socketId: socket.id });

        // signal to run the frontend callback
        callback();
    }
}