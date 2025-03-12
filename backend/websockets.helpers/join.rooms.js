import { Socket } from "socket.io"
import { Server } from "socket.io"

/**
 * Send a signal to get games options from host
 * @param {Socket} socket
 * @param {Server} io
 * @returns 
 */
export function onGetRooms(socket, io) {
    return () => {
        const rooms = new Set();
        Array.from(io.sockets.sockets.values()).forEach(room => {
            const list = Array.from(room.rooms);
            for (const r of list) {
                if (r.includes('room')) rooms.add(r)
            }
        })
        const socketIORoomIds = Array.from(rooms.values())
        socket.emit("onrooms", socketIORoomIds);
    }
}