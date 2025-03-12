import { createContext, useState } from "react"
import MainMenu from "./views/MainMenu";
import BattleCards from "./views/BattleCards";
import GameOptions from "./views/GameOptions";
import Tutorial from "./views/Tutorial";
import GameLobby from "./views/GameLobby";
import io from 'socket.io-client';
import GameJoin from "./views/GameJoin";
import Player from "./classes/player";
import GameAudio from "./components/GameAudio";
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AvailableGames from "./views/AvailableGames";
const BACKENDURL = import.meta.env.PROD == false ? 'http://localhost:3002' : 'https://bc.m2kdevelopments.com'


// eslint-disable-next-line react-refresh/only-export-components
export const socket = io(BACKENDURL)// connect to websocket server


// all the possible pages of the game
export const PAGE_MENU = 0,
  PAGE_TUTORIAL = 1,
  PAGE_SETTINGS = 2,
  PAGE_GAMEOPTIONS = 3,
  PAGE_GAMELOBBY = 4,
  PAGE_GAME = 5,
  PAGE_JOINGAME = 6;


export const ContextData = createContext({

  // used in Settings page
  settings: {},
  setSettings: (s) => s,

  //  used in GameOptions Page
  gameoptions: {
    playername: "",
    area: "",
    npcs: [],
    decks: 3,
    roomId: "",
    host: false,
    gametime: 300,
    startpoints: 1000,
    // a copy of the settings for the main game for each player. Defined in GameLobby.jsx
    game: {
      players: [new Player()], area: "", cardIndexOnTable: -1,
      lightCards: [], darkCards: [],
    }
  },
  setGameOptions: (settings) => settings
});


function App() {

  const [settings, setSettings] = useState({})
  const [gameoptions, setGameOptions] = useState({
    playername: "",
    area: "",
    npcs: [],
    decks: 3,
    roomId: "",
    host: false,
    gametime: 300,
    startpoints: 1000,
    // a copy of the settings for the main game for each player. Defined in GameLobby.jsx
    game: {
      players: [new Player()], area: "", cardIndexOnTable: -1,
      lightCards: [], darkCards: [],
    }
  });


  return (
    <ContextData.Provider value={{ settings, setSettings, gameoptions, setGameOptions }}>
      <main className="w-screen h-screen">
        <GameAudio />

        <Router>

          <Routes>
            <Route index path="/" element={<MainMenu />} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/options" element={<GameOptions />} />
            <Route path="/available" element={<AvailableGames />} />
            <Route path="/join" element={<GameJoin />} />
            <Route path="/lobby" element={<GameLobby />} />
            <Route path="/game" element={<BattleCards />} />
          </Routes>

        </Router>
        <ToastContainer />
      </main>
    </ContextData.Provider>
  )
}

export default App
