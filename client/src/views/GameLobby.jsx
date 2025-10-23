import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import { ContextData, socket } from "../App";
import Loading from "../components/Loading";
import Player from "../classes/player";
import DarkOverlay from "../components/DarkOverlay";
import CHARACTERS from '../jsons/characters.json';
// import { toast } from 'react-toastify';
import KeyboardAudio from "../components/KeyboardAudio";
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';


function GameLobby() {

    // get gameoptions that were saved from GameOptions Page in global variable
    const { gameoptions, setGameOptions } = useContext(ContextData);
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const navigate = useNavigate();


    // useReducer to be used for multiple or complicated useStates
    const reducer = (state, action) => {

        // update gameoption for each player
        if (action.game) setGameOptions({ ...gameoptions, game: action.game })

        // when a player disconnects from the websocket
        if (action.disconnected) {
            const socketId = action.disconnected;
            const index = state.players.findIndex(p => p.socketId == socketId);
            if (index !== -1) {
                const player = state.players[index];
                const remainingPlayers = state.players.filter((p, i) => i != index);
                console.log(player.name, 'Left the chat');
                return { ...state, players: remainingPlayers };
            }
        }

        // when player is ready update player ready state
        if (action.ready != undefined) {
            let index = state.players.findIndex(p => p.socketId == action.socketId);
            if (index !== -1) state.players[index].ready = action.ready;// update ready state
            index = state.gameoptions.players.findIndex(p => p.socketId == action.socketId);
            if (index !== -1) state.gameoptions.players[index].ready = action.ready;// update ready state
            return { ...state };
        }


        if (action.chat) { // adding a new chat message
            return { ...state, chats: [action.chat, ...state.chats] };
        }

        if (action.player) { // adding a new player
            return { ...state, players: [...state.players, action.player] };
        }

        if (action.gameoptions) { // update game options
            return { ...state, gameoptions: action.gameoptions };
        }

        return state;
    }

    const [state, dispatch] = useReducer(reducer, { chats: [], players: [], gameoptions: { startpoints: 300, gametime: 300, players: [] } })

    const playerIcons = useMemo(() => {
        const map = new Map();
        const colors = ["orange", 'pink', 'red', 'green', 'cyan', 'yellow', 'lightblue']
        let count = 0;
        for (const person of state.gameoptions.players) {
            const c = CHARACTERS.find(c => c.name === person.name);
            map.set(person.name, { ...person, id: c.id, image: `avatars/${c.id}.jpeg`, color: colors[count++ % colors.length] })
        }
        return map;
    }, [state.gameoptions.players])


    // Update every player on the state of the game
    useEffect(() => {
        // Initial Load
        const roomId = window.location.href.replace("&cancel=true", '').replace(/.*join=/gmi, '');
        const onGameOption = () => socket.emit('gameoptions', gameoptions.roomId || roomId, (gameoptions) => dispatch({ gameoptions }));
        onGameOption()

        // when player disconnects from server
        socket.on('ondisconnected', onGameOption)
        return () => socket.off('ondisconnected', onGameOption)
    }, [gameoptions.host, gameoptions.roomId]);


    // Listen for web sockets emits from server
    useEffect(() => {

        // when message comes in data = {chat: {name, message}}
        const onChat = (data) => dispatch({ chat: data.chat })
        socket.on('onchat', onChat);

        // when player joins room
        const onJoin = (data) => dispatch({ player: data })
        socket.on('onjoin', onJoin);

        // when player joins room
        const onReady = (data) => dispatch({ ready: data.ready, socketId: data.socketId })
        socket.on('onready', onReady);

        // when player disconnects from server
        const onDisconnected = (socketId) => dispatch({ disconnected: socketId })
        socket.on('ondisconnected', onDisconnected)

        // update game options from everyone
        const onGameOptions = (options) => dispatch({ gameoptions: options });
        socket.on('ongameoptions', onGameOptions)


        // there a count down timer in the backend so this will listen for the each second on the count down
        const onLoadGame = (data) => {
            const {
                countdown,
                players,
                area,
                gametime,
                cards, // {lightCards, darkCards}
                cardIndexOnTable,
            } = data;


            // start the defining game settings when player option shows up
            if (players) {

                const game = {
                    ...cards, // lightCards, darkCards
                    area,
                    gametime,
                    cardIndexOnTable,
                    players: players.map(p => new Player(p.id, p.name, p.npc, p.score, p.cards))
                }

                // setup the game options for each player
                dispatch({ game });
            }

            setCountdown(countdown);

            // start loading
            setLoading(true);
        }
        socket.on('onloadgame', onLoadGame)

        // when the host pressed back to game options
        socket.on('oncancelgame', () => window.location.href = window.location.href.replace('lobby', 'join') + "&cancel=true")


        // on dismount remove listeners
        return () => {
            socket.off('onchat', onChat);
            socket.off('onjoin', onJoin);
            socket.off('onready', onReady);
            socket.off('onloadgame', onLoadGame)
            socket.off('ongameoptions', onGameOptions)
            socket.off('ondisconnected', onDisconnected)
        }
    }, []);


    // Waiting for game to start
    useEffect(() => {
        // start the game
        if (countdown <= 0) navigate('/game')
    }, [countdown, navigate])


    // const onCopyGameLink = async () => {

    //     // get base url
    //     const url = window.location.href.replace("lobby", 'join');
    //     const roomId = gameoptions.roomId;

    //     // create join link - You can use its implementation in App.jsx
    //     const link = `${url}?join=${roomId}`; // https://battle.cards/join?join=134234234

    //     // write to clipboard
    //     await window.navigator.clipboard.writeText(link);

    //     // alert new that link was copied
    //     // alert(link);
    //     toast('Join link has been copied to clipboard')
    // }


    const onSendMessageToChat = (e) => {
        //prevenet form for submitting and refreshing
        e.preventDefault();

        // get message
        const message = e.target.chat.value;

        // send message via websockets to a room
        socket.emit('chat', { name: gameoptions.playername, message: message, roomId: gameoptions.roomId }, dispatch);

        e.target.chat.value = "";
    }

    const onReady = () => {
        // send to server that you are ready, setReady is the callback that is called
        // everything is done successfully
        socket.emit('ready', { ready: ready, roomId: gameoptions.roomId }, (r) => {
            setReady(r);
            dispatch({ ready: r, socketId: socket.id });
        })
    }


    const onStart = () => {
        // show loading animations
        const options = { ...gameoptions, players: state.players, newgame: true };
        socket.emit('loadgame', options, () => setLoading(true));
    }


    const onCancelLobby = async () => {
        const result = await swal({
            title: "Cancel Game",
            text: "Go back will kick everyone out of this lobby. Do you want do continue?",
            icon: 'info',
            buttons: ['No', 'Yes']
        });
        if (!result) return;
        socket.emit('cancelgame', gameoptions.roomId, () => navigate('/options'));
    }


    if (loading) return <Loading area={gameoptions.area || state.gameoptions.area} countDown={countdown} />


    return (
        <div>
            <DarkOverlay color="rgba(0, 0, 0, 0.65)" />
            <KeyboardAudio name={gameoptions.playername} roomId={gameoptions.roomId} />
            <div className="text-white h-screen relative" style={{ backgroundImage: `url(areas/${gameoptions.area || state.gameoptions.area}.jpeg)`, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}>
                
                {/* Back Button - Only for Host */}
                {gameoptions.host ? 
                    <button 
                        className='group absolute top-4 sm:top-6 left-2 sm:left-4 md:left-6 z-30 text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center justify-center'
                        onClick={onCancelLobby}
                        aria-label="Back to game options"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-pink-700 transition-transform duration-300 group-hover:scale-110"></div>
                        <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"></div>
                        <span className="relative text-white font-bold tracking-wide drop-shadow-lg leading-none text-sm sm:text-base">← Back</span>
                    </button>
                : null}

                {/* Title Section */}
                <div className="pt-16 sm:pt-20 px-4 sm:px-6 z-10 relative text-center sm:text-left">
                    <div className="bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-purple-900/60 backdrop-blur-sm rounded-3xl px-4 sm:px-8 py-3 sm:py-4 border border-purple-500/40 shadow-2xl inline-block max-w-full">
                        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl whitespace-nowrap overflow-hidden text-ellipsis">
                            Battle Cards <span className="hidden xs:inline">Lobby</span> 
                            <span className="text-yellow-300">({state.gameoptions?.players?.length || state.players.length})</span>
                        </h1>
                    </div>
                    <div className="mt-2 sm:mt-3 bg-purple-900/40 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-2 sm:py-3 border border-purple-500/30 shadow-lg inline-block">
                        <h6 className="text-base sm:text-xl font-semibold">You: <span className="text-pink-300">{gameoptions.playername}</span></h6>
                    </div>
                </div>

                {/* Game Options */}
                {/* <div className="flex gap-3 py-1 px-8">
                    {!gameoptions.host ? <button className='text-md z-10 px-6 py-2 rounded-sm shadow-xl hover:shadow-2xl bg-pink-700 text-white  hover:bg-amber-700 duration-500 cursor-pointer' onClick={onCopyGameLink}>Copy Link</button> : null}
                </div> */}

                {/* Player Icons */}
                <div className="relative z-10 py-3 sm:py-4 px-4 sm:px-8 w-full flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
                    {state.gameoptions.players.map(p =>
                        <div key={playerIcons.get(p.name).id} className="relative flex flex-col items-center gap-2">
                            <div className="relative">
                                <img 
                                    title={p.name} 
                                    className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full shadow-2xl border-2 sm:border-4 border-white/80" 
                                    src={playerIcons.get(p.name).image} 
                                />
                                {p.ready ?
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white shadow-lg">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                : null}
                            </div>
                            <span className="text-[10px] xs:text-xs font-semibold text-white bg-purple-900/60 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full border border-purple-400/40 max-w-[80px] xs:max-w-[100px] truncate">{p.name}</span>
                        </div>
                    )}
                </div>

                {/* Show the chat message */}
                <div className="h-[180px] sm:h-[200px] md:h-[250px] overflow-y-auto bg-[#39393962] backdrop-blur-sm z-10 relative mx-4 sm:mx-6 md:mx-8 my-2 flex flex-col gap-1 p-3 sm:p-4 rounded-2xl border border-purple-500/30 shadow-xl">
                    <h6 className="flex flex-wrap gap-1 sm:gap-2 items-center text-sm sm:text-base">
                        <img src="icon.png" alt="" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
                        <b className="text-blue-200">Battle Card: </b>
                        <span>Game Time is <b className="text-orange-400">{gameoptions.gametime || state.gameoptions.gametime}s</b> and your starting points are <b className="text-orange-400">{gameoptions.startpoints || state.gameoptions.startpoints}pts</b></span>
                    </h6>
                    {state.chats.map((chat, index) =>
                        <h6 key={index} className="flex gap-2 items-center">
                            <img src={playerIcons.get(chat.name)?.image || ""} alt={chat.name} className="w-8 h-8 rounded-full" />
                            <b style={{ color: playerIcons.get(chat.name)?.color || "" }} className="text-pink-200">{chat.name}: </b>
                            <span>{chat.message}</span>
                        </h6>)}
                </div>

                {/* Submit a message to the lobby */}
                <form onSubmit={onSendMessageToChat} className="w-full flex z-10 relative px-4 sm:px-6 md:px-8 py-2 sm:py-3">
                    <input 
                        className="w-full p-2 sm:p-3 md:p-4 text-sm sm:text-base rounded-l-2xl text-white bg-[#3b3b3b8b] backdrop-blur-sm border-2 border-purple-500/30 focus:border-pink-500/50 focus:outline-none transition-all duration-300" 
                        type="text" 
                        required 
                        name="chat" 
                        maxLength={300} 
                        placeholder="Enter your message here..." 
                    />
                    <button 
                        className="group relative px-6 overflow-hidden rounded-r-2xl transform transition-all duration-300 hover:scale-105 active:scale-95" 
                        type="submit"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 transition-transform duration-300 group-hover:scale-110"></div>
                        <div className="absolute inset-0 border-2 border-pink-400/50 rounded-r-2xl group-hover:border-pink-400 transition-all duration-300"></div>
                        <span className="relative text-white font-bold drop-shadow-lg">Send</span>
                    </button>
                </form>

                {/* Start Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center p-2 sm:p-3 md:p-4 z-10 relative">
                    {/* Ready Button */}
                    <button
                        className="group relative text-base sm:text-lg md:text-xl px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 min-w-[120px] sm:min-w-[140px] md:min-w-[150px]"
                        onClick={onReady}
                    >
                        <div className={`absolute inset-0 transition-all duration-300 group-hover:scale-110 ${
                            ready 
                                ? 'bg-gradient-to-r from-red-700 to-red-900' 
                                : 'bg-gradient-to-r from-green-600 to-emerald-700'
                        }`}></div>
                        <div className={`absolute inset-0 rounded-2xl border-2 opacity-50 group-hover:opacity-100 transition-all duration-300 ${
                            ready 
                                ? 'border-red-400 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]' 
                                : 'border-green-400 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]'
                        }`}></div>
                        <span className="relative text-white font-bold drop-shadow-lg">
                            {ready ? "✗ Not Ready" : "✓ Ready!"}
                        </span>
                    </button>

                    {/* Only host can start the game. */}
                    {gameoptions.host ?
                        <button
                            className="group relative text-base sm:text-lg md:text-xl px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 min-w-[140px] sm:min-w-[180px] md:min-w-[200px]"
                            disabled={!ready}
                            onClick={onStart}
                        >
                            <div className={`absolute inset-0 transition-all duration-300 group-hover:scale-110 ${
                                (state.players.filter(p => !p.ready).length || !ready) 
                                    ? 'bg-gradient-to-r from-gray-600 to-gray-800' 
                                    : 'bg-gradient-to-r from-pink-600 via-pink-700 to-red-700'
                            }`}></div>
                            <div className={`absolute inset-0 rounded-2xl border-2 opacity-50 group-hover:opacity-100 transition-all duration-300 ${
                                (state.players.filter(p => !p.ready).length || !ready)
                                    ? 'border-gray-400'
                                    : 'border-pink-400 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]'
                            }`}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative text-white font-bold drop-shadow-lg">
                                {(!state.players.filter(p => !p.ready).length && ready) ? "🎮 Start Game" : "⏳ Waiting..."}
                            </span>
                        </button>
                        : null}
                </div>
            </div>
        </div>
    )
}
export default GameLobby