/* eslint-disable no-unused-vars */
import { useContext, useEffect, useMemo, useState, useCallback } from "react"
import { ContextData, socket } from "../App"
import { Card } from "../classes/card";
import PlayingCard from '../components/PlayingCard'



// the number seconds a player has to make a play.
const PLAYER_PLAY_TIME = 15;




function BattleCards() {

  // get gameoptions that were saved from GameOptions Page in global variable
  const { gameoptions } = useContext(ContextData);

  // game modes
  const [clockwise, setClockwise] = useState(true);
  const [lightMode, setLightMode] = useState(true);
  const [battleMode, setBattleMode] = useState(false);
  const [colorDemand, setColorDemand] = useState("");
  const [gameOver, setGameOver] = useState(false);

  // time
  const [gameTime, setGameTime] = useState(gameoptions.game.gametime);
  const [playerTime, setPlayerTime] = useState(PLAYER_PLAY_TIME); // updated in the dispatch reducer function

  // cards
  const [lightCards, setLightCards] = useState(gameoptions.game.lightCards)
  const darkCards = useMemo(() => gameoptions.game.darkCards, [gameoptions.game.darkCards])
  const [cardIndexOnTable, setCardIndexOnTable] = useState(gameoptions.game.cardIndexOnTable);
  const [cardsOnTable, setCardsOnTable] = useState(new Set());

  //players 
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [players, setPlayers] = useState(gameoptions.game.players)

  // get index of this player
  const meIndex = useMemo(() => players.findIndex(p => p.id == socket.id), [players])
  const cards = useMemo(() => players[meIndex].getCards(lightCards, darkCards, lightMode), [players, meIndex, lightCards, darkCards, lightMode]);
  const currentCard = useMemo(() => {
    const l = lightCards[cardIndexOnTable];
    return new Card(l.index, l.type, l.value, l.color, l.battleValue, l.darkId);
  }, [lightCards, cardIndexOnTable])



  // initialize game timer
  useEffect(() => {
    // tell backend to start a set interval timer
    if (gameoptions.host) socket.emit('starttimer', gameoptions.roomId, gameoptions.game.gametime);
  }, [gameoptions]);


  // listen for websocket
  useEffect(() => {

    // decrements playerTimer
    const t = setInterval(() => {
      const playerCount = gameoptions.game.players.length;
      const index = currentPlayerIndex;
      const room = gameoptions.roomId;
      if (!gameOver) socket.emit('playertime', room, playerTime, index, playerCount);
    }, 1000);

    // game timer
    const onTimer = (time, gameover) => {
      if (time > 0) setGameTime(time);
      if (gameover) setGameOver(true);
    }
    socket.on('ontime', onTimer);


    // player timer
    const onPlayerTimer = (time, currentPlayer, nextPlayer) => {

      // if the player time is up
      if (time <= 0) {

        // as punishment player has to pick a card for not playing
        // dispatch({ punishment: { playerIndex: currentPlayer } });
        // get all the cards in the players hands
        const allCardsInHand = new Set();
        for (const player of players) {
          for (const cardIndex of Array.from(player.cards.values())) {
            allCardsInHand.add(cardIndex)
          }
        }

        // add all the unplayable cards in set
        allCardsInHand.add(cardIndexOnTable);
        for (const cardIndex of cardsOnTable) allCardsInHand.add(cardIndex);

        // choose a card from list that is not in hand or on the table
        const cardIndex = lightCards.findIndex((l, i) => !allCardsInHand.has(i));

        // add card to player
        players[currentPlayer].cards.add(cardIndex);
        setPlayers([...players]);


        // update time
        setPlayerTime(PLAYER_PLAY_TIME);

        // trigger next player
        setCurrentPlayerIndex(nextPlayer);

      } else setPlayerTime(time);// update time
    }
    socket.on('onplayertime', onPlayerTimer);


    // when a card is picked
    const onPickedCard = (cardIndices, currentPlayerIndex, nextPlayerIndex) => {

      // update player
      for (const cardIndex of cardIndices) players[currentPlayerIndex].cards.add(cardIndex);
      setPlayers([...players])

      // trigger next player
      setCurrentPlayerIndex(nextPlayerIndex);

      // update time
      setPlayerTime(PLAYER_PLAY_TIME);

    }
    socket.on('onpickcard', onPickedCard)


    // when player has played card
    const onPlayCards = (cardIndex, playerIndex, newPlayerIndex) => {
      // updates player card in hand and table cards
      cardsOnTable.add(cardIndex)
      const newSetOfCards = new Set();
      for (const i of Array.from(cardsOnTable.values())) newSetOfCards.add(i);
      setCardsOnTable(newSetOfCards);

      // update player
      players[playerIndex].cards.delete(cardIndex);
      setPlayers([...players])

      setCurrentPlayerIndex(newPlayerIndex) // set new player
      setCardIndexOnTable(cardIndex); // update new card
      setPlayerTime(PLAYER_PLAY_TIME); // update time
    }
    socket.on('onplaycard', onPlayCards);

    // on dismount remove listener
    return () => {
      socket.off('ontimer', onTimer);
      socket.off('onplayertime', onPlayerTimer);
      socket.off('onpickcard', onPickedCard);
      socket.off('onplaycard', onPlayCards);
      clearInterval(t)
    }
  }, [cardIndexOnTable, lightCards, players, cardsOnTable, playerTime, currentPlayerIndex, gameoptions, gameOver])


  const onScoreCheck = () => {

  }

  const onTalk = () => {

  }

  const onFlipCards = () => {

  }

  const onLeave = () => {

  }


  /**
   * Pick a card on the table.
   */
  const onPick = () => {

    // game is over
    if (gameOver) return;

    // not your turn
    if (meIndex != currentPlayerIndex) return;

    // get all the cards in the players hands
    const allCardsInHand = new Set();
    for (const player of players) {
      for (const cardIndex of Array.from(player.cards.values())) {
        allCardsInHand.add(cardIndex)
      }
    }


    // add all the unplayable cards in set
    allCardsInHand.add(cardIndexOnTable);
    for (const cardIndex of cardsOnTable) allCardsInHand.add(cardIndex);

    // choose a card from list that is not in hand or on the table
    const cardIndex = lightCards.findIndex((l, i) => !allCardsInHand.has(i));

    // send data to websockets
    const data = {
      roomId: gameoptions.roomId,
      cardIndices: [cardIndex],
      playerIndex: currentPlayerIndex,
      playerCount: players.length
    }


    socket.emit('pickcard', data, (cardIndices, currentPlayerIndex, nextPlayerIndex) => {

      // update player
      players[currentPlayerIndex].addCards(...cardIndices);
      setPlayers([...players]);

      // trigger next player
      setCurrentPlayerIndex(nextPlayerIndex);

      // update time
      setPlayerTime(PLAYER_PLAY_TIME);
    })

  }

  /**
   * Play the choosen card in hand.
   * @param {Card} card 
   */
  const onPlayCard = (card) => {

    // game is over
    if (gameOver) return;

    // not your turn
    if (meIndex != currentPlayerIndex) return;

    // if card is playable
    if (!playableFilter(card)) return alert("Cannot play this card");

    // play the card
    const data = {
      roomId: gameoptions.roomId,
      card: card,
      playerIndex: currentPlayerIndex,
      playerCount: players.length,
      more: false, // more is to let the other players that you are still playing
    }

    socket.emit('playcard', data, (cardIndex, playerIndex, newPlayerIndex) => {
      players[playerIndex].cards.delete(cardIndex);
      setPlayers([...players])

      // updates player card in hand and table cards
      cardsOnTable.add(cardIndex)
      const newSetOfCards = new Set();
      for (const i of Array.from(cardsOnTable.values())) newSetOfCards.add(i);
      setCardsOnTable(newSetOfCards);

      setCurrentPlayerIndex(newPlayerIndex) // set new player
      setCardIndexOnTable(cardIndex); // update new card 
      setPlayerTime(PLAYER_PLAY_TIME); // update time
    });

  }


  const onStartNewGame = () => {
    socket.emit('resetgame', gameoptions.roomId, gameoptions.game.gametime, () => {
      
      // reset game time.
      setGameTime(gameoptions.game.gametime)

      // index of player who won
      setCurrentPlayerIndex(0);

      // shuffle & distrubute the cards 


      setGameOver(false);
    });

  }



  const playableFilter = useCallback((playcard) => {

    // get card in hand and playable
    const card = lightMode ? playcard : darkCards[playcard.darkId];
    const tableCard = lightMode ? currentCard : darkCards[currentCard.darkId];

    // if the game is in battle mode
    if (battleMode) return true;

    // logic to filter the cards
    if (tableCard.type === "reversecolor") {
      if (card.type === "number" && card.color != tableCard.color) return false;
      else if (card.type == "jumpcolor" && card.value !== tableCard.value) return false;

    } else if (tableCard.type === "jumpcolor") {

      if (card.type === "number" && card.color != tableCard.color) return false;
      else if (card.type == "reversecolor" && card.value !== tableCard.value) return false;

    } else if (tableCard.type === "number") {

      if (card.type === "number") {
        if (card.value != tableCard.value && card.color != tableCard.color) return false;
      }
      else if (card.type == "reversecolor" && card.value !== tableCard.color) return false;
      else if (card.type == "jumpcolor" && card.value !== tableCard.color) return false;

    } else if (tableCard.type === "iwant" && colorDemand) {
      if (card.type === "number" && card.value !== colorDemand) return false;
      else if (card.type == "reversecolor" && card.value !== colorDemand) return false;
      else if (card.type == "jumpcolor" && card.value !== colorDemand) return false;
    }

    return true;
  }, [currentCard, colorDemand, battleMode, lightMode, darkCards])



  // On Game Over
  if (gameOver) {
    return (
      <div className="w-screen h-screen flex flex-col">
        <h1>Game Over</h1>
        {gameoptions.host ? <button onClick={onStartNewGame}>Start New Game</button> : null}
        {
          players.map(player =>
            <div key={player.id}>{player.name}: {player.score} - {player.getPotentialGameEndDamage(lightCards, darkCards)}</div>
          )
        }
      </div>
    )
  }



  return (
    <div className="w-screen h-screen flex flex-col">

      {/* Players' Info */}
      <section className="fixed top-0 left-0 w-screen">
        <div>{clockwise ? ">>" : "<<"} Direction</div>
        <div className="flex gap-2 p-3">
          {players
            .map((player, index) => {
              if (index == currentPlayerIndex) return { ...player, playing: true, me: meIndex == index }
              else return { ...player, me: meIndex == index }
            })
            .map((player) =>
              <div
                className="shadow p-2 rounded-full w-14 h-14 flex justify-center items-center hover:shadow-lg hover:shadow-slate-300 cursor-pointer duration-500"
                style={{ border: player.playing ? "2px solid gold" : player.me ? "2px solid cyan" : undefined }}
                title={player.name}
                key={player.id}>
                {player.name}
              </div>
            )}
        </div>
        <div className="flex gap-5">
          {currentPlayerIndex == meIndex ? <div>Your Turn</div> : null}
          <div>{playerTime}s</div>
        </div>
        <div>Game Time: <div>{gameTime}s</div></div>
      </section>




      {/* Cards on the table */}
      <div className="h-[80vh] flex gap-4 justify-center items-center align-middle">

        {/* Cards thrown */}
        <PlayingCard
          sx={{ fontSize: 60, height: "33%", minWidth: 170 }}
          isDark={currentCard.isDark()}
          color={currentCard.color}>
          {currentCard.getText()}
        </PlayingCard>

        {/* Cards to pick from */}
        <div onClick={onPick} title="Pick Card" className="text-7xl h-1/3 min-w-40 py-5 px-2 flex justify-center items-center rounded-md bg-slate-300 border-slate-700 border-2 cursor-pointer shadow-md hover:shadow-lg hover:bg-slate-400 duration-200">
          🃏
        </div>
      </div>


      {/* Cards in Hand */}
      <div className="w-screen h-[12vh] max-h-[12vh] mb-6">
        <div className="flex justify-center items-center gap-3 overflow-x-scroll w-[95vw]">
          {cards.map(card =>
            <PlayingCard
              onPlay={() => onPlayCard(card)}
              key={card.index}
              isDark={card.isDark()}
              color={card.color}>
              {card.getText()}
            </PlayingCard>
          )}
        </div>
      </div>

      {/* Bottom buttons options */}
      <div className="w-screen max-h-[5vh] h-[5vh]">
        <div className="flex gap-4 justify-center items-center">
          <button onClick={onScoreCheck} title="Score Check" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">📃 Score</button>
          <button onClick={onTalk} title="Talk" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">🎤 Talk</button>
          <button onClick={onFlipCards} title="Flip Cards" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">🎤 Flip</button>
          <button onClick={onLeave} title="Leave" className="text-sm rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">📴 Leave</button>
        </div>
      </div>

    </div>
  )
}

export default BattleCards