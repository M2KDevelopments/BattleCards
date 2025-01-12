import { useContext, useMemo, useState } from "react";
import { ContextData, PAGE_GAMELOBBY, socket } from "../App";
import DarkOverlay from "../components/DarkOverlay";
import CHARACTERS from '../jsons/characters.json';
import KeyboardAudio from "../components/KeyboardAudio";


// eslint-disable-next-line react/prop-types
function GameJoin({ joinRoomId }) {

    // get gameoptions that were saved from GameOptions Page in global variable
    const { setGameOptions, setPage } = useContext(ContextData);
    const [playername, setPlayername] = useState(CHARACTERS[0].name);
    const avatar = useMemo(() => {
        return `banners/${CHARACTERS.find(c => c.name == playername).id}.png`;
    }, [playername])

    // send message to server websocket for this player to join room.
    const onJoin = () => {
        if (playername.trim() == "") return alert('Please enter playername');

        socket.emit('join', { name: playername, roomId: joinRoomId }, () => {
            console.log(`I've joined the room`);
            setGameOptions({ playername: playername, roomId: joinRoomId });
            setPage(PAGE_GAMELOBBY);
        });
    }


    const onPlayerSelect = (character) => {
        const { name, id } = character;
        setPlayername(name);
        const audio = new Audio(`audio/${id}.ogg`);
        audio.play();
        audio.onended = () => audio.remove();
    }



    return (
        <div>
            <DarkOverlay color="#00000077" />
            <KeyboardAudio name={playername} />
            <div className="h-screen flex flex-col items-center m-2 gap-2 overflow-hidden" style={{ backgroundImage: `url(join.png)`, backgroundSize: '100%', overflow: 'hidden' }}>
                <img src="logo.png" width={100} alt="Battle Cards" />
                <h1 className="tablet:text-4xl laptop:text-6xl p-3 z-10 relative text-white">Battle Cards Join Room</h1>


                <button className='text-2xl z-10 px-6 py-2 rounded-md shadow-xl hover:shadow-2xl bg-pink-600 hover:bg-purple-900 duration-150 text-white' onClick={onJoin}>Join Game</button>

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
                                    style={{ borderWidth: chr.name === playername ? 4 : 2, backgroundImage: `url(avatars/${chr.id}.jpeg)`, backgroundRepeat: 'no-repeat', backgroundSize: '100%', overflow: 'hidden' }}
                                    className='z-20 border-white w-28 h-28 bg-none rounded-lg hover:bg-[#000000a4] duration-300 hover:border-pink-700 cursor-pointer'
                                    onClick={() => onPlayerSelect(chr)}>

                                </div>
                            )
                        }
                    </div>

                </section>
            </div>
        </div>
    )
}

export default GameJoin