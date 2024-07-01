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


  // On socket disconnection
  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id)
    socket.broadcast.emit('ondisconnected', socket.id)
  });


  // socket should join room data 
  socket.on('join', async ({ name, roomId }, callback) => {

    // Join the room
    await socket.join(roomId);

    // send to everyone
    socket.to(roomId).emit("onjoin", { name, roomId, socketId: socket.id });

    // signal to run the frontend callback
    callback();
  });




  // when player clicks the ready button
  socket.on('ready', ({ ready, roomId }, callback) => {

    // send to everyone
    socket.to(roomId).emit("onready", { ready: !ready, socketId: socket.id });

    // signal to run the frontend callback
    callback(!ready);
  });




  // when player clicks the ready button
  socket.on('loadgame', ({ roomId, decks, area, npcs, players, playername }, callback) => {

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
        const settings = BattleCards.createGame({ decks, area, npcs, players, playername }, counter, socket.id);
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
      const gameOver = counter >= gameTime;
      socket.to(roomId).emit("ontime", gameTime - counter, gameOver);
      socket.emit("ontime", gameTime - counter, gameOver);
      if (counter >= gameTime) clearInterval(timer);
    }, 1000)
  });


  // get the time of the current player
  socket.on('playertime', (roomId, playerTimer, playerIndex, playerCount) => {
    const currentPlayer = playerIndex;
    const nextPlayer = (+playerIndex + 1) % playerCount;
    socket.to(roomId).emit("onplayertime", playerTimer-1, currentPlayer, nextPlayer);
    socket.emit("onplayertime", playerTimer-1, currentPlayer, nextPlayer);
  })



  /***********************************
   * Player Actions
   ************************************/


  // when a player picks a card.
  socket.on('pickcard', ({ roomId, cardIndices, playerIndex, playerCount }, callback) => {
    // send the cards to everyone that the current player picked
    // - cardIndices is an array of card index
    const currentPlayer = playerIndex;
    const nextPlayer = (+playerIndex + 1) % playerCount
    socket.to(roomId).emit("onpickcard", cardIndices, currentPlayer, nextPlayer);
    callback(cardIndices, currentPlayer, nextPlayer);
  });


  socket.on('playcard', ({ roomId, card, playerIndex, playerCount, more, battleMode }, callback) => {
    const currentPlayer = playerIndex;
    const nextPlayer = more ? currentPlayer : (+playerIndex + 1) % playerCount;


    // find out what kind of card it is - Todo
    switch (card.type) {
      default:
        break;
    }

    socket.to(roomId).emit("onplaycard", card.index, currentPlayer, nextPlayer);
    callback(card.index, currentPlayer, nextPlayer);
  });



};
