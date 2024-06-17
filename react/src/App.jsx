import { createContext, useEffect, useState } from "react"
import MainMenu from "./views/MainMenu";
import GameOver from "./views/GameOver";
import GameResults from "./views/GameResults";
import BattleCards from "./views/BattleCards";
import GameOptions from "./views/GameOptions";
import Settings from "./views/Settings";
import Tutorial from "./views/Tutorial";
import GameLobby from "./views/GameLobby";
import io from 'socket.io-client';
import GameJoin from "./views/GameJoin";

export const BACKENDURL = 'http://localhost:4000'
export const socket = io(BACKENDURL)// connect to websocket server



// all the possible pages of the game
export const PAGE_MENU = 0,
  PAGE_TUTORIAL = 1,
  PAGE_SETTINGS = 2,
  PAGE_GAMEOPTIONS = 3,
  PAGE_GAMELOBBY = 4,
  PAGE_GAME = 5,
  PAGE_RESULTS = 6,
  PAGE_GAMEOVER = 7,
  PAGE_JOINGAME = 8;


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
    roomId: "",
    host: false,
    // a copy of the settings for the main game for each player. Defined in GameLobby.jsx
    game: {
      players: [], area: "", cardIndexOnTable: -1,
      lightCards: [], darkCards: [], gametime: 300, startpoints: 1000
    }
  },
  setGameOptions: (settings) => settings
});


function App() {

  const [page, setPage] = useState(PAGE_MENU)
  const [settings, setSettings] = useState({})
  const [joinRoomId, setJoinRoomId] = useState("");
  const [gameoptions, setGameOptions] = useState({
    playername: "",
    area: "",
    npcs: [],
    decks: 3,
    roomId: "",
    host: false,
    // a copy of the settings for the main game for each player. Defined in GameLobby.jsx
    game: {
      players: [], area: "", cardIndexOnTable: -1,
      lightCards: [], darkCards: [], gametime: 300, startpoints: 1000
    }
  });



  // check if the url as a socket room id
  useEffect(() => {
    const url = window.location.href;
    if (url.includes("#join")) {
      const roomId = url.replace(/.*#join/gmi, '');
      setJoinRoomId(roomId);
      setPage(PAGE_JOINGAME);
    }
  }, [])


  return (
    <ContextData.Provider value={{
      page, setPage,
      settings, setSettings,
      gameoptions, setGameOptions
    }}>
      <main>

        {/* Show the correct page */}
        {page === PAGE_MENU && <MainMenu />}
        {page === PAGE_SETTINGS && <Settings />}
        {page === PAGE_TUTORIAL && <Tutorial />}
        {page === PAGE_GAMEOPTIONS && <GameOptions />}
        {page === PAGE_GAMELOBBY && <GameLobby />}
        {page === PAGE_JOINGAME && <GameJoin joinRoomId={joinRoomId} />}
        {page === PAGE_GAME && <BattleCards />}
        {page === PAGE_RESULTS && <GameResults />}
        {page === PAGE_GAMEOVER && <GameOver />}

      </main>
    </ContextData.Provider>
  )
}

export default App
