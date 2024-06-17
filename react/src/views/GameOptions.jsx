
import { useContext, useState, useEffect } from 'react';
import AREAS from '../jsons/areas.json';
import axios from 'axios';
import { ContextData, PAGE_GAMELOBBY, socket, BACKENDURL } from '../App';
const instance = axios.create()

export default function GameOptions() {

  const [playername, setPlayername] = useState("New Player");
  const [numberOfDecks, setNumberOfDecks] = useState(3);
  const [area, setArea] = useState(AREAS[0]);

  // npcs players settings
  const [allNpcs, setAllNpcs] = useState([])
  const [npcPlayers, setNpcPlayers] = useState([]);

  // page and gameoptions
  const { setPage, setGameOptions } = useContext(ContextData);



  // Get Npcs from backend
  useEffect(() => {
    (async () => {
      const response = await instance.get(`${BACKENDURL}/api/npcs`);
      const npcs = response.data;
      setAllNpcs(npcs);
    })()
  }, [])


  const onAddCharacters = (e) => {
    //prevent form from submitting
    e.preventDefault();

    // get the player from form data
    const npcIndex = e.target.npc.value;

    // if player was not choosen
    if (npcIndex === "-1") return alert("Please select a player");

    // check if the name already exists
    if (npcPlayers.includes(allNpcs[npcIndex])) return alert(`${allNpcs[npcIndex].name} already exists`);

    // if everything is good add player to list
    npcPlayers.push(allNpcs[npcIndex]);
    setNpcPlayers([...npcPlayers]);

  }


  /**
   * Remove the player from the list
   * @param {String} name 
   */
  const onRemovePlayers = (npc) => {
    setNpcPlayers(npcPlayers.filter(n => n.id !== npc.id));
  }


  const onPlay = () => {

    // goto lobby with the settings defined here
    const gamesettings = {
      playername: playername,
      area: area,
      npcs: npcPlayers,
      decks: numberOfDecks,
      roomId: "room" + socket.id,
      host: true,
    }

    // check player name was entered
    if (playername.trim() == '') return alert("Please enter a name");

    // check if at least one player was selected
    // if (!npcPlayers.length) return alert("Please enter an opponent");


    // Join the game room
    socket.emit('join', { name: playername, roomId: gamesettings.roomId }, () => {
      console.log(`I've joined the room`);
      setGameOptions(gamesettings);
      setPage(PAGE_GAMELOBBY);
    });
  }


  return (
    <div>
      <img src="logo.svg" width={100} alt="Battle Cards" />
      <h1>Battle Cards</h1>


      <h6>Player Name</h6>
      <input type='name' placeholder='Player Name' value={playername} onChange={e => setPlayername(e.target.value)} />

      {/* Showing NPCs chosen */}
      {npcPlayers.map(npc =>
        <div
          onClick={() => onRemovePlayers(npc)}
          key={npc.id}>{npc.name}
        </div>
      )}

      {/* Adding Characters */}
      <form onSubmit={onAddCharacters}>
        <select name="npc" defaultValue="-1">
          <option value="-1">Select Character</option>
          {allNpcs.map((npc, index) => <option key={npc.id} value={index}>{npc.name}</option>)}
        </select>
        <button type='submit'>Add Player</button>
      </form>


      {/* Selecting Number of Decks */}
      <h6>Number of Decks: {numberOfDecks}</h6>
      <input
        type='range'
        value={numberOfDecks}
        onChange={e => setNumberOfDecks(parseInt(e.target.value))}
        max={10}
        min={1}
      />


      {/* Select Area */}
      <h6>Select Location of Play</h6>
      <select value={area} onChange={e => setArea(e.target.value)}>
        {AREAS.map(name => <option key={name} value={name}>{name}</option>)}
      </select>


      <button onClick={onPlay}>Create Game</button>
    </div>


  )
}
