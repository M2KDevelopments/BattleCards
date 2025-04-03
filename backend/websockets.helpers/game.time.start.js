import { Socket } from "socket.io"

// keep timers in memory
const timersMap = new Map() // <roomId, timerId>


/**
 * When the game timer starts
 * @param {Socket} socket
 * @returns 
 */
export function onStartTimer(socket) {
    return (roomId, gameTime) => {

        // remove existing timers in case this was function was called more than once
        if(timersMap.get(roomId)) clearInterval(timersMap.get(roomId))

        // send to everyone
        let counter = 0;
        const timer = setInterval(() => {
            counter++;// increment time
            const gameOver = counter >= gameTime;
            socket.to(roomId).emit("ontime", gameTime - counter, gameOver);
            socket.emit("ontime", gameTime - counter, gameOver);
            if (counter >= gameTime) {
                clearInterval(timer);
                timersMap.delete(roomId)
            }
        }, 1000)

        // add timer id to memory
        timersMap.set(roomId, timer)
    }
}