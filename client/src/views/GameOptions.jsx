
import { useContext, useMemo, useState, useEffect } from 'react';
import AREAS from '../jsons/areas.json';
import CHARACTERS from '../jsons/characters.json';
import { ContextData, socket } from '../App';
import DarkOverlay from '../components/DarkOverlay';
import swal from 'sweetalert';
import KeyboardAudio from '../components/KeyboardAudio';
import { useNavigate } from 'react-router-dom';


const numberOfDecks = 8;

export default function GameOptions() {

  const { gameoptions, setGameOptions } = useContext(ContextData); // page and gameoptions
  const [playername, setPlayername] = useState(CHARACTERS[0].name);
  const [area, setArea] = useState(AREAS[0]);
  const [gameTime, setGameTime] = useState(gameoptions.gametime);
  const [score, setScore] = useState(gameoptions.startpoints)
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const avatar = useMemo(() => {
    return `banners/${CHARACTERS.find(c => c.name == playername).id}.png`;
  }, [playername])

  const onPlay = () => {

    // goto lobby with the settings defined here
    const gamesettings = {
      playername: playername,
      area: area,
      npcs: [],//npcPlayers,
      decks: numberOfDecks,
      roomId: "room" + socket.id + `__${playername.replace(/\s/gmi, '--')}`,
      host: true,
      gametime: gameTime,
      startpoints: score
    }

    // check player name was entered
    if (playername.trim() == '') return alert("Please enter a name");

    // Host joins the game room as player
    socket.emit('join', { name: playername, roomId: gamesettings.roomId, host: true, gameoptions: { ...gamesettings, host: undefined } }, () => {
      console.log(`Host has joined the room`);
      setGameOptions(gamesettings);
      navigate('/lobby')
    });
  }


  const onGameTime = async () => {
    const timestring = await swal({
      title: 'Game Time',
      text: `Enter the game time (seconds)`,
      icon: "info",
      content: {
        element: 'input',
        attributes: {
          value: gameTime.toString()
        }
      },
      buttons: ['Cancel', 'Set']
    });


    if (!timestring) return;
    try {
      const time = parseInt(timestring.trim());
      if (isNaN(time)) return;
      setGameTime(time);
    } catch (err) {
      console.log(err);
    }
  }


  const onStartPoints = async () => {
    const s = await swal({
      title: 'Start Points',
      text: `Enter the starting points for the game`,
      icon: "info",
      content: {
        element: 'input',
        attributes: {
          value: score.toString()
        }
      },
      buttons: ['Cancel', 'Set']
    });

    if (!s) return;


    try {
      const pts = parseInt(s.trim());
      if (isNaN(pts)) return;
      setScore(pts);
    } catch (err) {
      console.log(err);
    }
  }

  const onPlayerSelect = (character) => {
    const { name, id } = character;
    setPlayername(name);
    const audio = new Audio(`audio/${id}.ogg`);
    audio.play();
    audio.onended = () => audio.remove();
  }

  return (
    <>
      <DarkOverlay color="rgba(0, 0, 0, 0.65)" />
      <KeyboardAudio name={playername} />
      <div className='z-20 overflow-hidden relative' style={{ backgroundImage: `url(areas/${area}.jpeg)`, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}>

        {/* Back Button */}
        <button 
          className={`group absolute top-6 left-6 z-30 text-lg rounded-2xl px-6 py-3 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center justify-center ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
          onClick={() => navigate('/')}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-pink-700 transition-transform duration-300 group-hover:scale-110"></div>
          <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"></div>
          <span className="relative text-white font-bold tracking-wide drop-shadow-lg leading-none">← Back</span>
        </button>

        {/* Top Controls Section */}
        <section className={`grid gap-3 mobile:grid-cols-1 phone:grid-cols-1 phone-xl:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 m-6 mt-20 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          {/* Game Time Button */}
          <button 
            className='group relative text-xl z-10 px-6 py-4 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95'
            onClick={onGameTime}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-700 transition-transform duration-300 group-hover:scale-110"></div>
            <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
            <span className="relative text-white font-bold drop-shadow-lg">⏱️ Game Time: <span className="text-yellow-300">{gameTime}s</span></span>
          </button>

          {/* Start Points Button */}
          <button 
            className='group relative text-xl z-10 px-6 py-4 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95'
            onClick={onStartPoints}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 transition-transform duration-300 group-hover:scale-110"></div>
            <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]"></div>
            <span className="relative text-white font-bold drop-shadow-lg">💎 Start Points: <span className="text-yellow-300">{score}</span></span>
          </button>

          {/* Create Game Button */}
          <button 
            className='group relative text-xl z-10 px-6 py-4 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95'
            onClick={onPlay}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-pink-700 to-red-700 transition-transform duration-300 group-hover:scale-110"></div>
            <div className="absolute inset-0 rounded-2xl border-2 border-pink-400 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative text-white font-bold drop-shadow-lg">🎮 Create Game</span>
          </button>
        </section>

        {/* Show Main Character */}
        <div 
          className={`w-[32vw] h-[32vw] fixed bottom-0 right-0 drop-shadow-2xl transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}
          style={{ backgroundImage: `url(${avatar})`, backgroundRepeat: 'no-repeat', backgroundSize: '100%', overflow: 'hidden' }}
        >
        </div>

        <section className='px-10 flex flex-col gap-4 justify-center mx-auto h-screen my-auto content-center items-center align-middle'>
          {/* Player Name Display */}
          <div className={`z-20 w-full transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-purple-900/60 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/40 shadow-2xl inline-block">
              <p className='tablet:text-5xl laptop:text-7xl text-white font-black bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl'>
                {playername}
              </p>
            </div>
          </div>

          {/* Character Selection Grid */}
          <div className={`grid mobile:grid-cols-2 phone:grid-cols-3 phone-xl:grid-cols-4 tablet:grid-cols-5 tablet-xl:grid-cols-6 laptop:grid-cols-9 desktop-lg:grid-cols-10 desktop-xl:grid-cols-12 gap-3 w-full transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {
              CHARACTERS.map(chr =>
                <div
                  key={chr.id}
                  title={chr.name}
                  role="button"
                  style={{ 
                    borderWidth: chr.name === playername ? 4 : 2, 
                    backgroundImage: `url(avatars/${chr.id}.jpeg)`, 
                    backgroundRepeat: 'no-repeat', 
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    overflow: 'hidden' 
                  }}
                  className={`z-20 w-28 h-28 rounded-xl duration-300 cursor-pointer transform transition-all hover:scale-110 hover:-translate-y-1 ${
                    chr.name === playername 
                      ? 'border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.8)] scale-105' 
                      : 'border-white hover:border-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                  }`}
                  onClick={() => onPlayerSelect(chr)}>
                </div>
              )
            }
          </div>

        </section>

        {/* Area Selection Section */}
        <section className={`fixed bottom-3 flex gap-4 justify-center w-screen p-4 z-30 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-r from-purple-900/70 via-pink-900/70 to-purple-900/70 backdrop-blur-md rounded-3xl p-4 border border-purple-500/40 shadow-2xl flex gap-4">
            {AREAS.map(name =>
              <div 
                style={{ 
                  borderWidth: area === name ? 4 : 2, 
                  backgroundImage: `url(areas/${name}.jpeg)`, 
                  backgroundRepeat: 'no-repeat', 
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  overflow: 'hidden' 
                }}
                title={name}
                role="button"
                className={`z-30 w-24 h-24 rounded-2xl duration-300 cursor-pointer transform transition-all hover:scale-110 hover:-translate-y-2 ${
                  area === name 
                    ? 'border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.8)] scale-105' 
                    : 'border-white hover:border-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                }`}
                onClick={() => setArea(name)} 
                key={name}>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
