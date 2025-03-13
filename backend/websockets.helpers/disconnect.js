import { Socket } from "socket.io"

/**
 * Send message to Front End - socket.io callback will trigger the callback on the frontend
 * @param {Socket} socket
 * @param {Map<String, Map<string, object>>} RoomMap
 * @param {Map<String, any>} GameMap
 * @returns 
 */
export function onDisconnect(socket, RoomMap, GameMap) {
    return () => {

        // Remove player from memory
        const list = Array.from(RoomMap.keys())
        for (const key of list) {
            RoomMap.get(key).delete(socket.id)
            const noplayers = RoomMap.get(key).size == 0;
            if (noplayers) {
                GameMap.delete(key); // remove game options from memory
                RoomMap.delete(key) // remove room
            }
        }

        console.log("Disconnected", socket.id)
        socket.broadcast.emit('ondisconnected', socket.id)
    }
}