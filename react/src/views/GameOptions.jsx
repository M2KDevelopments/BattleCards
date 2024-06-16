
import { useContext, useState } from 'react';
import NPCS from '../jsons/npcs.json';
import AREAS from '../jsons/areas.json';
import { ContextData, PAGE_GAMELOBBY } from '../App';

export default function GameOptions() {


  const [playername, setPlayername] = useState("");
  const [npcPlayers, setNpcPlayers] = useState([]);
  const [numberOfDecks, setNumberOfDecks] = useState(3);
  const [area, setArea] = useState(AREAS[0]);
  const { setPage, setGameOptions } = useContext(ContextData);


  const onAddCharacters = (e) => {
    //prevent form from submitting
    e.preventDefault();

    // get the player from form data
    const name = e.target.npc.value;

    // if player was not choosen
    if (name === "-1") return alert("Please select a player");

    // check if the name already exists
    if (npcPlayers.includes(name)) return alert("Player already exists");

    // if everything is good add player to list
    npcPlayers.push(name);
    setNpcPlayers([...npcPlayers]);

  }


  /**
   * Remove the player from the list
   * @param {String} name 
   */
  const onRemovePlayers = (name) => {
    setNpcPlayers(npcPlayers.filter(n => n !== name));
  }


  const onPlay = () => {

    // goto lobby with the settings defined here
    const gamesettings = {
      playername: playername,
      area: area,
      npcs: npcPlayers,
      decks: numberOfDecks,
    }
    setGameOptions(gamesettings);
    setPage(PAGE_GAMELOBBY)
  }


  return (
    <div>
      <img src="logo.svg" width={100} alt="Battle Cards" />
      <h1>Battle Cards</h1>


      <h6>Player Name</h6>
      <input type='name' placeholder='Player Name' value={playername} onChange={e => setPlayername(e.target.value)} />

      {/* Showing NPCs chosen */}
      {npcPlayers.map(name =>
        <div
          onClick={() => onRemovePlayers(name)}
          key={'player' + name}>{name}
        </div>
      )}

      {/* Adding Characters */}
      <form onSubmit={onAddCharacters}>
        <select name="npc" defaultValue="-1">
          <option value="-1">Select Character</option>
          {NPCS.map(name => <option key={name} value={name}>{name}</option>)}
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
