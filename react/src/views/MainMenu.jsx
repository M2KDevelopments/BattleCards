import { useContext } from "react"
import { ContextData } from "../App"
import { PAGE_GAMEOPTIONS, PAGE_TUTORIAL } from "../App";


function MainMenu() {

  const { setPage } = useContext(ContextData);

  return (
    <div className="flex flex-col gap-4 justify-center m-8">
      <img className="text-center m-auto" src="logo.svg" width={100} alt="Battle Cards" />
      <h1 className="text-center text-2xl">Battle Cards</h1>
      <button className="text-purple-700 hover:text-pink-700 duration-200" onClick={() => setPage(PAGE_TUTORIAL)}>How to Play</button>
      <button className="text-purple-700 hover:text-pink-700 duration-200" onClick={() => setPage(PAGE_GAMEOPTIONS)}>Start Battle Cards</button>
    </div>
  )

}

export default MainMenu