
import { useContext, useState  } from 'react';
import AREAS from '../jsons/areas.json';
import CHARACTERS from '../jsons/characters.json';
import { ContextData, PAGE_GAMELOBBY, socket } from '../App';
import DarkOverlay from '../components/DarkOverlay';
// import axios from 'axios';
// const instance = axios.create()
const numberOfDecks = 8;


export default function GameOptions() {

  const [playername, setPlayername] = useState("New Player");
  const [area, setArea] = useState(AREAS[0]);

  // npcs players settings
  // const [allNpcs, setAllNpcs] = useState([])
  // const [npcPlayers, setNpcPlayers] = useState([]);

  // page and gameoptions
  const { setPage, gameoptions, setGameOptions } = useContext(ContextData);

  const [gameTime, setGameTime] = useState(gameoptions.gametime);
  const [score, setScore] = useState(gameoptions.startpoints)


  // Get Npcs from backend
  // useEffect(() => {
  //   (async () => {
  //     const response = await instance.get(`${BACKENDURL}/api/npcs`);
  //     const npcs = response.data;
  //     setAllNpcs(npcs);
  //   })()
  // }, [])


  // const onAddCharacters = (e) => {
  //   //prevent form from submitting
  //   e.preventDefault();

  //   // get the player from form data
  //   const npcIndex = e.target.npc.value;

  //   // if player was not choosen
  //   if (npcIndex === "-1") return alert("Please select a player");

  //   // check if the name already exists
  //   if (npcPlayers.includes(allNpcs[npcIndex])) return alert(`${allNpcs[npcIndex].name} already exists`);

  //   // if everything is good add player to list
  //   npcPlayers.push(allNpcs[npcIndex]);
  //   setNpcPlayers([...npcPlayers]);

  // }


  /**
   * Remove the player from the list
   * @param {String} name 
   */
  // const onRemovePlayers = (npc) => {
  //   setNpcPlayers(npcPlayers.filter(n => n.id !== npc.id));
  // }


  const onPlay = () => {

    // goto lobby with the settings defined here
    const gamesettings = {
      playername: playername,
      area: area,
      npcs: [],//npcPlayers,
      decks: numberOfDecks,
      roomId: "room" + socket.id,
      host: true,
      gametime: gameTime,
      startpoints: score
    }


    // check player name was entered
    if (playername.trim() == '') return alert("Please enter a name");

    // check if at least one player was selected
    // if (!npcPlayers.length) return alert("Please enter an opponent");


    // Host joins the game room as player
    socket.emit('join', { name: playername, roomId: gamesettings.roomId }, () => {
      console.log(`Host has joined the room`);
      setGameOptions(gamesettings);
      setPage(PAGE_GAMELOBBY);
    });
  }


  return (
    <>
      <DarkOverlay color="#00000077" />
      <div className='z-20'>

        <section className='flex gap-4 justify-center m-8'>
          <button className='text-2xl z-10 px-6 py-2 rounded-2xl shadow-xl hover:shadow-2xl bg-blue-600 hover:bg-blue-900 duration-150 text-white' onClick={() => setGameTime(((gameTime + 100) % 1000) || 1000)}>Game Time: <span>{gameTime}</span>s</button>
          <button className='text-2xl z-10 px-6 py-2 rounded-2xl shadow-xl hover:shadow-2xl bg-blue-600 hover:bg-blue-900 duration-150 text-white' onClick={() => setScore(((score + 100) % 5000) || 5000)}>Start Points: <span>{score}</span></button>
          <button className='text-2xl z-10 px-6 py-2 rounded-2xl shadow-xl hover:shadow-2xl bg-purple-600 hover:bg-purple-900 duration-150 text-white' onClick={onPlay}>Create Game</button>
        </section>


        {/* Showing NPCs chosen */}
        {/* {npcPlayers.map(npc =>
        <div
          onClick={() => onRemovePlayers(npc)}
          key={npc.id}>{npc.name}
        </div>
      )}

      {/* Adding Characters */}
        {/* <form onSubmit={onAddCharacters}>
        <select name="npc" defaultValue="-1">
          <option value="-1">Select Character</option>
          {allNpcs.map((npc, index) => <option key={npc.id} value={index}>{npc.name}</option>)}
        </select>
        <button type='submit'>Add Player</button>
      </form>   */}


        <section className='px-10 flex flex-col gap-3 justify-center mx-auto h-screen my-auto content-center items-center align-middle'>
          <p className='z-20 text-6xl text-white w-full text-left font-black'>{playername}</p>
          <div className='grid grid-cols-10 w-full'>
            {
              CHARACTERS.map(name =>
                <div title={name} key={name} onClick={() => setPlayername(name)} className='m-4 z-20 border-2 border-white w-32 h-32  bg-none hover:bg-[#000000a4] duration-300'>

                </div>
              )
            }
          </div>

        </section>

        <section className='fixed bottom-3 flex gap-4 justify-center w-screen p-4'>
          {AREAS.map(name =>
            <div title={name} className='z-20 border-2 border-white w-24 h-24 rounded-xl bg-none hover:bg-[#000000a4] duration-300' onClick={() => setArea(name)} key={name}>
              <span>{name}</span>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
