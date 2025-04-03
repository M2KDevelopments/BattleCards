import { Socket } from "socket.io"


/**
 * when a player plays one of the cards in hand
 * @param {Socket} socket
 * @returns 
 */
export function onPlayCard(socket) {
    return (data, callback) => {

        const { roomId, card, playerIndex, playerCount, clockwise, battleMode, lightMode, cardsToPick, noCards, colorDemand } = data;

        const currentPlayer = playerIndex;

        // default next player
        let nextPlayer = (+playerIndex + 1) % playerCount;
        if (!clockwise) {
            if (playerIndex - 1 < 0) nextPlayer = playerCount - 1;
            else nextPlayer = playerIndex - 1;
        }

        // its still the current players turn
        const gamestate = { lightMode: lightMode, clockwise: clockwise, battleMode, cardsToPick, pickcard: false, colorDemand }

        if (card.type === "reversecolor") { // if it is a card that needs another supporting cards

            gamestate.clockwise = !clockwise;
            if (!battleMode) nextPlayer = currentPlayer;
            else {
                nextPlayer = (+playerIndex + 1) % playerCount;
                if (!gamestate.clockwise) {
                    if (playerIndex - 1 < 0) nextPlayer = playerCount - 1;
                    else nextPlayer = playerIndex - 1;
                }
            }

        } else if (card.type === "reverse") { // reverse the direction of players turn
            gamestate.clockwise = !clockwise;
        } else if (card.type === "jump" || card.type === "jumpcolor") { // skip a player
            // skip the next player
            if (!battleMode) {
                if (clockwise) nextPlayer = (+playerIndex + 2) % playerCount;
                else {
                    if (playerCount == 2) nextPlayer = currentPlayer;// if there are only two players
                    else if (playerIndex == 0) nextPlayer = playerCount - 2; // skip to second last person
                    else if (playerIndex == 1) nextPlayer = playerCount - 1; // skip to last person
                    else nextPlayer -= 2;
                }
            }
        } else if (card.type === "flip") { // toggle light/dark mode
            gamestate.lightMode = !lightMode;
        } else if (card.type === "pick") { // enter battle mode
            gamestate.battleMode = true;
            gamestate.cardsToPick += card.value;
        } else if (card.type === "pickuntil") { // pick cards until you find a certain color.
            gamestate.battleMode = true;
        } else if (card.type === "number") { // a number card is played
            if (battleMode) { // if in battle
                // skip to that player
                if (clockwise) nextPlayer = (+playerIndex + card.value) % playerCount;
                else {
                    if ((playerCount == 2) && (card.value % 2 == 0)) nextPlayer = currentPlayer;// if there are only two players
                    else if (playerIndex == card.value) nextPlayer = 0; // first player
                    else if (card.value % playerCount == 0) nextPlayer = currentPlayer; //same player
                    else if ((playerIndex - card.value) < 0) {
                        const positionsToMove = (card.value % playerCount)
                        if (positionsToMove > playerIndex) nextPlayer = playerCount - (positionsToMove - playerIndex);
                        else nextPlayer = playerIndex - positionsToMove;
                    }
                    else nextPlayer = playerIndex - card.value;
                }
            }
        }

        if (noCards) {
            if (card.type === "number") {
                if (battleMode) {

                } else {
                    // game over
                    socket.to(roomId).emit("ongameover");
                    socket.emit("ongameover");
                }
            } else {
                if (!battleMode) {
                    // make it the current player so that the game make them pick a card
                    // after they automatically pick it will go to the next player
                    nextPlayer = currentPlayer;

                    // pick a card
                    gamestate.pickcard = true;
                }
            }
        }

        socket.to(roomId).emit("onplaycard", card.index, currentPlayer, nextPlayer, gamestate);
        callback(card.index, currentPlayer, nextPlayer, gamestate);
    }
}