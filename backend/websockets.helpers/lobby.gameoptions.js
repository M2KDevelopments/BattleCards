import { Socket } from "socket.io"

/**
 * When a games options have been requested
 * @param {Socket} socket
 * @param {Map<String, Map<string, object>>} RoomMap
 * @param {Map<String, any>} GameMap
 * @returns 
 */
export function onGameOptions(socket, RoomMap, GameMap) {
    return (roomId, callback) => {
        const players = Array.from(RoomMap.get(roomId)?.values() || [])
        const gameoptions = GameMap.get(roomId) || {};
        gameoptions.players = players;
        socket.to(roomId).emit("ongameoptions", gameoptions)
        callback(gameoptions);
    }
}