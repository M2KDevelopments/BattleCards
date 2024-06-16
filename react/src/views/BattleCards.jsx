import { useContext, useEffect } from "react"
import { ContextData } from "../App"

function BattleCards() {

  const { gameoptions, socket } = useContext(ContextData);


  useEffect(() => {
    // Listen for web sockets emits from server
    console.log(socket);
  }, [socket]);

  // Get distributed cards and players from backen
  // Get index of this player

  return (
    <div>
      <img src="logo.svg" width={100} alt="Battle Cards" />
      <h1>Battle Cards Game</h1>
      <h6>{gameoptions.playername}</h6>
    </div>
  )
}

export default BattleCards