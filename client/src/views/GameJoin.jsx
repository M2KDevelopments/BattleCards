import { useContext, useEffect, useMemo, useState } from "react";
import { ContextData, socket } from "../App";
import DarkOverlay from "../components/DarkOverlay";
import CHARACTERS from '../jsons/characters.json';
import KeyboardAudio from "../components/KeyboardAudio";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useWindowSize from "../hooks/useWindowSize";


// eslint-disable-next-line react/prop-types
function GameJoin() {

    // get gameoptions that were saved from GameOptions Page in global variable
    const { setGameOptions } = useContext(ContextData);
    const [playername, setPlayername] = useState(CHARACTERS[0].name);
    const [joinRoomId, setJoinRoomId] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();
    const isDesktop = useWindowSize()
    const avatar = useMemo(() => {
        return `banners/${CHARACTERS.find(c => c.name == playername).id}.png`;
    }, [playername])



    // check if the url as a socket room id
    useEffect(() => {
        const url = window.location.href;
        if (url.includes("join=")) {
            const roomId = url.replace("&cancel=true", '').replace(/.*join=/gmi, '');
            setJoinRoomId(roomId);
        }
        if (url.includes("&cancel=true")) toast('Host just cancelled the game.');
        setTimeout(() => setIsLoaded(true), 100);
    }, [])




    // send message to server websocket for this player to join room.
    const onJoin = () => {
        if (playername.trim() == "") return alert('Please enter playername');

        //play audio 
        const audio = document.getElementById("main-audio");
        audio.volume = 0.08;
        audio.play();

        // join websocket
        socket.emit('join', { name: playername, roomId: joinRoomId }, () => {
            console.log(`I've joined the room`, { playername: playername, roomId: joinRoomId });
            setGameOptions({ playername: playername, roomId: joinRoomId });
            navigate(`/lobby?join=${joinRoomId}`);
        });
    }


    const onPlayerSelect = (character) => {
        const { name, id } = character;
        setPlayername(name);
        const audio = new Audio(`audio/${id}.ogg`);
        audio.play();
        audio.onended = () => audio.remove();
    }


    if (!joinRoomId || !joinRoomId.trim()) return (
        <div className="flex flex-col justify-center items-center text-white bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 h-screen">
            <div className="animate-pulse">
                <img src="logo.png" width={200} alt="Battle Cards" className="mb-4" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Loading...</h1>
            </div>
        </div>
    )


    return (
        <div>
            <DarkOverlay color="rgba(0, 0, 0, 0.65)" />
            <KeyboardAudio name={playername} />
            <div className="h-screen flex flex-col items-center gap-4 overflow-hidden relative" style={{ backgroundImage: isDesktop ? `url(join.jpg)` : `url(join_phone.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}>
                
                {/* Back Button */}
                <button 
                    className={`group absolute top-6 left-6 z-30 text-lg rounded-2xl px-6 py-3 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center justify-center ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                    onClick={() => navigate('/')}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-pink-700 transition-transform duration-300 group-hover:scale-110"></div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"></div>
                    <span className="relative text-white font-bold tracking-wide drop-shadow-lg leading-none">← Back</span>
                </button>

                {/* Header Section */}
                <div className={`flex flex-col items-center gap-3 mt-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <img src="logo.png" width={isDesktop ? 120 : 80} alt="Battle Cards" className="drop-shadow-2xl" />
                    <div className="bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-purple-900/60 backdrop-blur-sm rounded-3xl px-8 py-4 border border-purple-500/40 shadow-2xl">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl text-center">
                            Join Battle Room
                        </h1>
                    </div>
                </div>

                {/* Join Button */}
                <button 
                    className={`group relative text-2xl z-10 px-12 py-4 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    onClick={onJoin}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-pink-700 to-red-700 transition-transform duration-300 group-hover:scale-110"></div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-pink-400 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative text-white font-bold drop-shadow-lg">🎮 Join Game</span>
                </button>

                {/* Show Main Character */}
                <div 
                    className={`w-[40vw] h-[40vw] fixed bottom-0 right-0 drop-shadow-2xl transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}
                    style={{ backgroundImage: `url(${avatar})`, backgroundRepeat: 'no-repeat', backgroundSize: '100%', overflow: 'hidden' }}
                >
                </div>

                <section className='px-10 flex flex-col gap-4 justify-center mx-auto h-screen my-auto content-center items-center align-middle'>
                    {/* Player Name Display */}
                    <div className={`z-20 w-full transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-purple-900/60 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/40 shadow-2xl inline-block">
                            <p className='text-4xl md:text-6xl lg:text-7xl text-white font-black bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl'>
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
            </div>
        </div>
    )
}

export default GameJoin