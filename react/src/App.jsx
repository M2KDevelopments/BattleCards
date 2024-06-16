import { createContext, useState } from "react"
import MainMenu from "./views/MainMenu";
import GameOver from "./views/GameOver";
import GameResults from "./views/GameResults";
import BattleCards from "./views/BattleCards";
import GameOptions from "./views/GameOptions";
import Settings from "./views/Settings";
import Tutorial from "./views/Tutorial";
import GameLobby from "./views/GameLobby";
import io from 'socket.io-client';
const socket = io('http://localhost:4000')// connect to server

// all the possible pages of the game
export const PAGE_MENU = 0,
  PAGE_TUTORIAL = 1,
  PAGE_SETTINGS = 2,
  PAGE_GAMEOPTIONS = 3,
  PAGE_GAMELOBBY = 4,
  PAGE_GAME = 5,
  PAGE_RESULTS = 6,
  PAGE_GAMEOVER = 7;


// global variable to know what page we are on
export const ContextData = createContext({
  page: PAGE_MENU,
  setPage: (page) => page,

  // used in Settings page
  settings: {},
  setSettings: (s) => s,

  //  used in GameOptions Page
  gameoptions: {
    playername: "",
    area: "",
    npcs: [],
    decks: 3,
  },
  setGameOptions: (settings) => settings,

  //websocket
  socket: socket,
});


function App() {

  const [page, setPage] = useState(PAGE_MENU)
  const [settings, setSettings] = useState({})
  const [gameoptions, setGameOptions] = useState({
    playername: "",
    area: "",
    npcs: [],
    decks: 3,
  })

  return (
    <ContextData.Provider value={{
      page, setPage,
      settings, setSettings,
      gameoptions, setGameOptions,
      socket
    }}>
      <main>

        {/* Show the correct page */}
        {page === PAGE_MENU && <MainMenu />}
        {page === PAGE_SETTINGS && <Settings />}
        {page === PAGE_TUTORIAL && <Tutorial />}
        {page === PAGE_GAMEOPTIONS && <GameOptions />}
        {page === PAGE_GAMELOBBY && <GameLobby />}
        {page === PAGE_GAME && <BattleCards />}
        {page === PAGE_RESULTS && <GameResults />}
        {page === PAGE_GAMEOVER && <GameOver />}

      </main>
    </ContextData.Provider>
  )
}

export default App
