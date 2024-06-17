/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react"
import { ContextData, socket } from "../App"

function BattleCards() {

  // get gameoptions that were saved from GameOptions Page in global variable
  const { gameoptions } = useContext(ContextData);

  // initialize game
  const [players, setPlayers] = useState(gameoptions.game.players);
  const [gameTime, setGameTime] = useState(gameoptions.game.gametime);
  const [cardIndexOnTable, setCardIndexOnTable] = useState(gameoptions.game.cardIndexOnTable);
  const [lightCards, setLightCards] = useState(gameoptions.game.lightCards)
  const [darkCards, setDarkCards] = useState(gameoptions.game.darkCards)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [clockwise, setClockwise] = useState(true);

  // const reducer = (state, action) => {
  //   if (action.addcard) state.cardsOnTable.add(action.addcard)//addcard
  //   return { ...state, }
  // }
  // const [state, dispatch] = useReducer(reducer, {
  //   cardsOnTable: new Set()
  // });


  // set interval for each player to update timer
  useEffect(() => {
    if (gameoptions.host) socket.emit('starttimer', gameoptions.roomId, gameoptions.game.gametime)
  }, [gameoptions]);


  // listen for websocket
  useEffect(() => {
    const onTimer = (time) => setGameTime(time);
    socket.on('ontime', onTimer);

    // on dismount remove listener
    return () => {
      socket.off('ontimer', onTimer);
    }
  }, [])



  return (
    <div>
      <img src="logo.svg" width={100} alt="Battle Cards" />
      <h1>Battle Cards Game</h1>
      <h6>Game Time: {gameTime}s</h6>
      <h6>Player Name: {gameoptions.playername}</h6>
      <h6>Current Player: {players[currentPlayerIndex].name}</h6>
      <h6>Area: {gameoptions.game.area}</h6>
      <h6>Current Card: {cardIndexOnTable}</h6>
      <h6>{players.length} Players</h6>
      <h6>{lightCards.length || darkCards.length} Cards in Player</h6>
    </div>
  )
}

export default BattleCards