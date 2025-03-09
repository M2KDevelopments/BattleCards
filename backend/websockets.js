import { Socket } from "socket.io"
import { onChat } from "./websockets.helpers/lobby.chat.js"
import { onDisconnect } from "./websockets.helpers/disconnect.js"
import { onJoin } from "./websockets.helpers/lobby.join.js"
import { onGameOptions } from "./websockets.helpers/gameoptions.js"
import { onReady } from "./websockets.helpers/lobby.ready.js"
import { onLoadGame } from "./websockets.helpers/lobby.loadgame.js"
import { onStartTimer } from "./websockets.helpers/game.time.start.js"
import { onPlayerTime } from "./websockets.helpers/game.time.player.js"
import { onPickCard } from "./websockets.helpers/player.pickcard.js"
import { onPlayCard } from "./websockets.helpers/player.playcard.js"

/**
 * On connection handle for Battle Cards when a connection is made.
 * @param {Socket} socket
 */
export function onConnection(socket) {

  // Log the connection
  console.log("Battle Cards Connection", socket.id);



  /***********************************
   * Lobby Actions
   ************************************/

  // Send message to Front End - socket.io callback will trigger the callback on the frontend
  socket.on("chat", onChat(socket));

  // On socket disconnection
  socket.on("disconnect", onDisconnect(socket));

  // socket should join room data 
  socket.on('join', onJoin(socket));

  // Update everyone with game options in the room
  socket.on('gameoptions', onGameOptions(socket));

  // when player clicks the ready button
  socket.on('ready', onReady(socket));

  // When the host clicks the ready button in the lobby
  socket.on('loadgame', onLoadGame(socket));






  /***********************************
   * Timer Actions
   ************************************/

  // when the game timer starts
  socket.on('starttimer', onStartTimer(socket));

  // get the time of the current player
  socket.on('playertime', onPlayerTime(socket));






  /***********************************
   * Audio Actions
   ************************************/

  // when when audio should be played on all users
  socket.on('audio', ({ name, playerId, num, roomId }) => {
    socket.to(roomId).emit("onaudio", playerId, name, num);
  });

  // when when audio should be played on all users
  socket.on('sound', ({ folder, sound, text, roomId }) => {
    socket.to(roomId).emit("onsound", folder, sound, text);
    socket.emit("onsound", folder, sound, text);
  });



  /***********************************
   * Player Actions
   ************************************/


  // when a player picks a card.
  socket.on('pickcard', onPickCard(socket));

  // when a player plays one of the cards in hand
  socket.on('playcard', onPlayCard(socket));

};
