import { Socket } from "socket.io"

// keep timers in memory
const playerTimerMap = new Map() // <roomId, timerId>


/**
 * When the game timer starts
 * @param {Socket} socket
 * @returns 
 */
export function onPlayerTime(socket) {


  return (data) => {
    const { roomId, playerTimer, playerIndex, playerCount, cardsToPick, pickUntil, clockwise, cardIndexOnTable } = data;

    // if the player index and card index is the same do NOT reset the timer
    const gamedata = playerTimerMap.get(roomId)
    if (gamedata && (gamedata.playerIndex == playerIndex) && (cardIndexOnTable == gamedata.cardIndexOnTable)) return

    // send to everyone
    let counter = playerTimer;

    const timer = setInterval(() => {
      counter--;// decrement time
      const currentPlayer = playerIndex;
      let nextPlayer = (+playerIndex + 1) % playerCount;
      if (!clockwise) {
        if (playerIndex == 0) nextPlayer = playerCount - 1
        else nextPlayer = playerIndex - 1
      }
      socket.to(roomId).emit("onplayertime", counter, currentPlayer, nextPlayer, cardsToPick, pickUntil);
      socket.emit("onplayertime", counter, currentPlayer, nextPlayer, cardsToPick, pickUntil);
      if (counter <= 0) {
        clearInterval(timer);
        playerTimerMap.delete(roomId)
      }
    }, 1000)

    // add game data to memory
    playerTimerMap.set(roomId, { playerIndex, cardIndexOnTable, timer })
  }
}