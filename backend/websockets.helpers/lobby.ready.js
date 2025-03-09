import { Socket } from "socket.io"


/**
 * When player clicks the ready button in the lobby
 * @param {Socket} socket
 * @returns 
 */
export function onReady(socket) {
    return ({ ready, roomId }, callback) => {

        // send to everyone
        socket.to(roomId).emit("onready", { ready: !ready, socketId: socket.id });
    
        // signal to run the frontend callback
        callback(!ready);
      }
}