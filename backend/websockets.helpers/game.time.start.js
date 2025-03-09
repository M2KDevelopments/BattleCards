import { Socket } from "socket.io"


/**
 * When the game timer starts
 * @param {Socket} socket
 * @returns 
 */
export function onStartTimer(socket) {
    return (roomId, gameTime) => {
        // send to everyone
        let counter = 0;
        const timer = setInterval(() => {
            counter++;// increment time
            const gameOver = counter >= gameTime;
            socket.to(roomId).emit("ontime", gameTime - counter, gameOver);
            socket.emit("ontime", gameTime - counter, gameOver);
            if (counter >= gameTime) clearInterval(timer);
        }, 1000)
    }
}