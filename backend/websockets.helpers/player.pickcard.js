import { Socket } from "socket.io"


/**
 * when a player picks a card.
 * @param {Socket} socket
 * @returns 
 */
export function onPickCard(socket) {
    return (data, callback) => {
        // send the cards to everyone that the current player picked
        // - cardIndices is an array of card index
        const { roomId, cardIndices, playerIndex, playerCount, clockwise, continueBattle, pickUntil } = data;
        const currentPlayer = playerIndex;

        // default next player
        let nextPlayer = (+playerIndex + 1) % playerCount;
        if (!clockwise) {
            if (playerIndex - 1 < 0) nextPlayer = playerCount - 1;
            else nextPlayer = playerIndex - 1;
        }

        socket.to(roomId).emit("onpickcard", cardIndices, currentPlayer, nextPlayer, continueBattle);
        callback(cardIndices, currentPlayer, nextPlayer, continueBattle);
    }
}