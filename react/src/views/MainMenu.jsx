import { useContext } from "react"
import { ContextData } from "../App"
import { PAGE_GAMEOPTIONS, PAGE_SETTINGS, PAGE_TUTORIAL } from "../App";


function MainMenu() {

  const { setPage } = useContext(ContextData);

  return (
    <div>
      <img src="logo.svg" width={100} alt="Battle Cards" />
      <h1>Battle Cards</h1>
      <button onClick={() => setPage(PAGE_TUTORIAL)}>How to Play</button>
      <button onClick={() => setPage(PAGE_GAMEOPTIONS)}>Start Battle Cards</button>
      <button onClick={() => setPage(PAGE_SETTINGS)}>Settings</button>
    </div>
  )
  
}

export default MainMenu