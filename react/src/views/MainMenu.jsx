import { useContext } from "react"
import { ContextData } from "../App"
import { PAGE_GAMEOPTIONS, PAGE_TUTORIAL } from "../App";
import DarkOverlay from "../components/DarkOverlay";


function MainMenu() {

  const { setPage } = useContext(ContextData);

  return (
    <div className="h-screen flex flex-col gap-4 justify-center items-center align-middle m-auto">
      <DarkOverlay />
      <img className="text-center opacity-40" src="logo.png" width={300} alt="Battle Cards" />
      <h1 className="z-10 text-center text-7xl text-white font-bold">Battle Cards</h1>
      <button className="z-10 text-2xl rounded-3xl px-8 py-2 border-2 border-purple-300 bg-purple-700 hover:bg-pink-700 duration-200 text-white" onClick={() => setPage(PAGE_TUTORIAL)}>How to Play</button>
      <button className="z-10 text-2xl rounded-3xl px-8 py-2 border-2 border-purple-300 bg-purple-700 hover:bg-pink-700 duration-200 text-white" onClick={() => setPage(PAGE_GAMEOPTIONS)}>Start Battle Cards</button>
    </div>
  )

}

export default MainMenu