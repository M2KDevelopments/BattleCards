import { Socket } from "socket.io"

/**
 * When a socket joins room update the players and games options.
 * @param {Socket} socket
 * @param {Map<String, Map<string, object>>} RoomMap
 * @param {Map<String, any>} GameMap
 * @returns 
 */
export function onJoin(socket, RoomMap, GameMap) {
    return async ({ name, roomId, host, gameoptions }, callback) => {

        // Join the room
        await socket.join(roomId);

        const player = { name, roomId, socketId: socket.id };

        // Add Player to memory
        if (RoomMap.get(roomId)) {
            const map = RoomMap.get(roomId)
            map.set(socket.id, player)
            RoomMap.set(roomId, map)
        } else {
            const map = new Map()
            map.set(socket.id, player);
            RoomMap.set(roomId, map)
        }

        // Set up game options
        // gameoptions is sent by the GameOptions.jsx
        if (gameoptions) GameMap.set(roomId, gameoptions)

        // send to everyone
        socket.to(roomId).emit("onjoin", { name, roomId, socketId: socket.id, host });

        // signal to run the frontend callback
        callback();
    }
}