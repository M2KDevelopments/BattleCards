const { Socket } = require("socket.io");
const BattleCards = require("./battlecards");

/**
 * 
 * @param {Socket} socket
 */
exports.onConnection = (socket) => {

  // Log the connection
  console.log("Battle Cards Connection", socket.id);

  // Send message to Front End - socket.io callback will trigger the callback on the frontend
  socket.on("chat", ({ name, roomId, message }, callback) => {
    const date = Date.now();
    socket.to(roomId).emit("onchat", { chat: { name, message, socketId: socket.id, date } });
    callback({ chat: { name, message, date } });
  });



  // socket should join room data 
  socket.on('join', async ({ name, roomId }, callback) => {

    // Join the room
    await socket.join(roomId);

    // send to everyone
    socket.to(roomId).emit("onjoin", { name, roomId, socketId: socket.id });

    // signal to run the frontend callback
    callback();
  })




  // when player clicks the ready button
  socket.on('ready', ({ ready, roomId }, callback) => {

    // send to everyone
    socket.to(roomId).emit("onready", { ready: !ready, socketId: socket.id });

    // signal to run the frontend callback
    callback(!ready);
  });



  // when player clicks the ready button
  socket.on('loadgame', ({ roomId, decks, area, npcs, players }, callback) => {

    // send countdown messages to everyone
    const maxCount = 10;
    let counter = maxCount;
    const timer = setInterval(() => {

      // send to everyone
      socket.to(roomId).emit("onloadgame", { countdown: counter });
      socket.emit("onloadgame", { countdown: counter });
      counter--; // minus 1 the counter

      // start the game state
      if (counter === parseInt(maxCount / 2)) {
        // shuffle players
        // shuffle cards
        // distribute cards
        // choose 1st card on the table
        // send state of the game to all players.
        const settings = BattleCards.createGame({ decks, area, npcs, players }, counter, socket.id);
        socket.to(roomId).emit("onloadgame", settings);
        socket.emit("onloadgame", settings);
      }
      else if (counter < 0) clearInterval(timer);
    }, 1000)


    // signal to run the frontend callback
    callback();
  });


  // when the game timer starts
  socket.on('starttimer', (roomId, gameTime) => {
    // send to everyone
    let counter = 0;
    const timer = setInterval(() => {
      counter++;// increment time
      socket.to(roomId).emit("ontime", gameTime - counter);
      socket.emit("ontime", gameTime - counter);
      if (counter >= gameTime) clearInterval(timer);
    }, 1000)
  });


  // On socket disconnection
  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id)
    socket.broadcast.emit('ondisconnected', socket.id)
  });
};
