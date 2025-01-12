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


  // socket should join room data 
  socket.on('gameoptions', (data, callback) => {
    socket.to(data.roomId).emit("ongameoptions", data)
    callback(data);
  });


  // when player clicks the ready button
  socket.on('ready', ({ ready, roomId }, callback) => {

    // send to everyone
    socket.to(roomId).emit("onready", { ready: !ready, socketId: socket.id });

    // signal to run the frontend callback
    callback(!ready);
  });




  // when player clicks the ready button
  socket.on('loadgame', (data, callback) => {

    // get data coming from frontend
    const { roomId, decks, area, npcs, players, playername, gametime, startpoints, anothergame } = data;


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
        const p = !anothergame ? [...players, { name: playername, socketId: socket.id }] : players
        const settings = BattleCards.createGame({ decks, area, npcs, players: p, gametime, startpoints }, counter);

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


  // when when audio should be played on all users
  socket.on('audio', ({ name, playerId, num, roomId }) => {
    socket.to(roomId).emit("onaudio", playerId, name, num);
  });


  // when when audio should be played on all users
  socket.on('sound', ({ folder, sound, text, roomId }) => {
    socket.to(roomId).emit("onsound", folder, sound, text);
    socket.emit("onsound", folder, sound, text);
  });


  // get the time of the current player
  socket.on('playertime', (data) => {
    const { roomId, playerTimer, playerIndex, playerCount, cardsToPick, pickUntil } = data;
    const currentPlayer = playerIndex;
    const nextPlayer = (+playerIndex + 1) % playerCount;
    socket.to(roomId).emit("onplayertime", playerTimer - 1, currentPlayer, nextPlayer, cardsToPick, pickUntil);
    socket.emit("onplayertime", playerTimer - 1, currentPlayer, nextPlayer, cardsToPick, pickUntil);
  })



  /***********************************
   * Player Actions
   ************************************/


  // when a player picks a card.
  socket.on('pickcard', (data, callback) => {
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
  });


  socket.on('playcard', (data, callback) => {

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
          if (playerCount == 2 && card.value % 2 == 0) nextPlayer = currentPlayer;// if there are only two players
          else if (playerIndex - card.value < 0) nextPlayer = playerCount - (playerIndex - card.value);
          else nextPlayer -= card.value;
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
  });



};
