import { Socket } from "socket.io"

/**
 * When the game timer starts
 * @param {Socket} socket
 * @returns 
 */
export function onPlayerTime(socket) {
    return (data) => {
        const { roomId, playerTimer, playerIndex, playerCount, cardsToPick, pickUntil } = data;
        const currentPlayer = playerIndex;
        const nextPlayer = (+playerIndex + 1) % playerCount;
        socket.to(roomId).emit("onplayertime", playerTimer - 1, currentPlayer, nextPlayer, cardsToPick, pickUntil);
        socket.emit("onplayertime", playerTimer - 1, currentPlayer, nextPlayer, cardsToPick, pickUntil);
      }
}