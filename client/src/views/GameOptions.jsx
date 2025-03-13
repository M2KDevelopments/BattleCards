
import { useContext, useMemo, useState } from 'react';
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
  const navigate = useNavigate();

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
      <DarkOverlay color="#00000077" />
      <KeyboardAudio name={playername} />
      <div className='z-20 overflow-hidden' style={{ backgroundImage: `url(areas/${area}.jpeg)`, backgroundSize: '100%', overflow: 'hidden' }}>

        <section className='grid gap-2 mobile:grid-cols-1 phone:grid-cols-1 phone-xl:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 m-6'>
          <button className='text-2xl z-10 px-6 py-2 rounded-md shadow-xl hover:shadow-2xl bg-blue-600 hover:bg-blue-900 duration-150 text-white' onClick={onGameTime}>Game Time: <span>{gameTime}</span>s</button>
          <button className='text-2xl z-10 px-6 py-2 rounded-md shadow-xl hover:shadow-2xl bg-blue-600 hover:bg-blue-900 duration-150 text-white' onClick={onStartPoints}>Start Points: <span>{score}</span></button>
          <button className='text-2xl z-10 px-6 py-2 rounded-md shadow-xl hover:shadow-2xl bg-pink-600 hover:bg-purple-900 duration-150 text-white' onClick={onPlay}>Create Game</button>
        </section>

        {/* Show Main Character */}
        <div className='w-[40vw] h-[40vw] fixed bottom-0 right-0 drop-shadow-2xl shadow-white' style={{ backgroundImage: `url(${avatar})`, backgroundRepeat: 'no-repeat', backgroundSize: '100%', overflow: 'hidden' }}>

        </div>

        <section className='px-10 flex flex-col gap-3 justify-center mx-auto h-screen my-auto content-center items-center align-middle'>
          <p className='z-20 tablet:text-6xl laptop:text-8xl text-white w-full text-left font-black'>{playername}</p>
          <div className='grid mobile:grid-cols-2 phone:grid-cols-3 phone-xl:grid-cols-4 tablet:grid-cols-5 tablet-xl:grid-cols-6 laptop:grid-cols-9 desktop-lg:grid-cols-10 desktop-xl:grid-cols-12 gap-2 w-full'>
            {
              CHARACTERS.map(chr =>
                <div
                  key={chr.id}
                  title={chr.name}
                  role="button"
                  style={{ borderWidth: chr.name === playername ? 4 : 2, backgroundImage: `url(avatars/${chr.id}.jpeg)`, backgroundRepeat: 'no-repeat', backgroundSize: '100%', overflow: 'hidden' }}
                  className='z-20 border-white w-28 h-28 bg-none rounded-lg hover:bg-[#000000a4] duration-300 hover:border-pink-700 cursor-pointer'
                  onClick={() => onPlayerSelect(chr)}>

                </div>
              )
            }
          </div>

        </section>

        <section className='fixed bottom-3 flex gap-4 justify-center w-screen p-4 z-30'>
          {AREAS.map(name =>
            <div style={{ borderWidth: area === name ? 4 : 2, background: `url(areas/${name}.jpeg)`, backgroundImage: `url(areas/${name}.jpeg)`, backgroundRepeat: 'no-repeat', backgroundSize: '100%', overflow: 'hidden' }}
              title={name}
              role="button"
              className='z-30 border-white w-24 h-24 rounded-xl bg-none hover:bg-[#000000a4] duration-300 hover:border-pink-700 cursor-pointer'
              onClick={() => setArea(name)} key={name}>

            </div>
          )}
        </section>
      </div>
    </>
  )
}
