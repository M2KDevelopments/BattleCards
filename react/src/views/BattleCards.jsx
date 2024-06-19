/* eslint-disable no-unused-vars */
import { useContext, useEffect, useMemo, useReducer, useState } from "react"
import { ContextData, socket } from "../App"
import { Card } from "../classes/card";
import PlayingCard from '../components/PlayingCard'

function BattleCards() {

  // get gameoptions that were saved from GameOptions Page in global variable
  const { gameoptions } = useContext(ContextData);

  // initialize game
  const [players, setPlayers] = useState(gameoptions.game.players);
  const [gameTime, setGameTime] = useState(gameoptions.game.gametime);
  const [playerTime, setPlayerTime] = useState(15);
  const [cardIndexOnTable, setCardIndexOnTable] = useState(gameoptions.game.cardIndexOnTable);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [clockwise, setClockwise] = useState(true);
  const [lightMode, setLightMode] = useState(true);

  // cards
  const [lightCards, setLightCards] = useState(gameoptions.game.lightCards)
  const darkCards = useMemo(() => gameoptions.game.darkCards, [gameoptions.game.darkCards])

  // get index of this player
  const meIndex = useMemo(() => players.findIndex(p => p.id == socket.id), [players])


  const cards = useMemo(() => {
    return players[meIndex].getCards(lightCards, darkCards, lightMode);
  }, [players, meIndex, lightCards, darkCards, lightMode]);


  const currentCard = useMemo(() => {
    const l = lightCards[cardIndexOnTable];
    return new Card(l.index, l.type, l.value, l.color, l.battleValue, l.darkId);
  }, [lightCards, cardIndexOnTable])


  // I'm using useReducer to avoid using too many useState variables in a useEffect
  const reducer = (state, action) => {
    if (action.nextplayer != undefined) {

      // only host can send 
      if (gameoptions.host) {
        const plyrs = players.map(player =>
          player.getJSON(lightCards, darkCards, lightMode)
        )
        const card = currentCard.getJSON();
        const t = gameTime;
        const r = gameoptions.roomId;
        const data = {
          roomId: gameoptions.roomId,
          index: action.nextplayer,
          players: plyrs,
          currentCard: currentCard,
          gameTime: gameTime,
          lightMode: lightMode
        }
        socket.emit('nextplayer', data)
      }
    }

    if (action.pickcard) {
      const { cardIndices, playerIndex } = action.pickcard;
      players[playerIndex].addCards(cardIndices);
      setPlayers([...players]);
    }

    // add card to table
    if (action.addcard) state.cardsOnTable.add(action.addcard)//addcard
    return { ...state, }
  }
  const [state, dispatch] = useReducer(reducer, {
    cardsOnTable: new Set()
  });


  // set interval for each player to update timer
  useEffect(() => {
    if (gameoptions.host) socket.emit('starttimer', gameoptions.roomId, gameoptions.game.gametime)
  }, [gameoptions]);


  // next player
  useEffect(() => {
    // should trigger on when the current player changes
    dispatch({ nexplayer: currentPlayerIndex });
  }, [currentPlayerIndex])


  // listen for websocket
  useEffect(() => {

    // game timer
    const onTimer = (time) => setGameTime(time);
    socket.on('ontime', onTimer);

    // player timer
    const onPlayerTimer = (time) => setPlayerTime(time);
    socket.on('onplayertime', onPlayerTimer);

    const onPickedCard = (cardIndices, currentPlayerIndex, nextPlayerIndex) => {

      // add cards to hand
      const pickcard = { cardIndices, playerIndex: currentPlayerIndex }
      dispatch({ pickcard });

      // trigger next player
      setCurrentPlayerIndex(nextPlayerIndex);
    }
    socket.on('onpickcard', onPickedCard)

    // on dismount remove listener
    return () => {
      socket.off('ontimer', onTimer);
      socket.off('onplayertime', onPlayerTimer);
      socket.off('onpickcard', onPickedCard);
    }
  }, [])


  const onScoreCheck = () => {

  }

  const onTalk = () => {

  }

  const onLeave = () => {

  }


  const onPick = () => {

    // not your turn
    if (meIndex != currentPlayerIndex) return;

    // get all the cards in the players hands
    const allCardsInHand = new Set();
    for (const player of players) {
      for (const cardIndex of Array.from(player.cards.values())) {
        allCardsInHand.add(cardIndex)
      }
    }

    // 
    for (const cardIndex of state.cardsOnTable) allCardsInHand.add(cardIndex);

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

      // add cards to hand
      const pickcard = { cardIndices, playerIndex: currentPlayerIndex }
      dispatch({ pickcard });

      // trigger next player
      setCurrentPlayerIndex(nextPlayerIndex);
    })

  }


  return (
    <div className="w-screen h-screen flex flex-col">

      {/* Players' Info */}
      <section className="fixed top-0 left-0 w-screen">
        <div>{clockwise ? "<<" : ">>"} Direction</div>
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
          <button onClick={onScoreCheck} title="Score Check" className="text-md rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">📃 Score</button>
          <button onClick={onTalk} title="Talk" className="text-md rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">🎤 Talk</button>
          <button onClick={onLeave} title="Leave" className="text-md rounded-3xl py-2 px-4 bg-gradient-to-bl from-blue-700 to-purple-600 shadow-lg cursor-pointer text-white font-semibold hover:font-bold hover:shadow-2xl duration-500">📴 Leave</button>
        </div>
      </div>

    </div>
  )
}

export default BattleCards