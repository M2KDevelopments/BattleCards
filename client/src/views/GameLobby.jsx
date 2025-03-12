import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import { ContextData, socket } from "../App";
import Loading from "../components/Loading";
import Player from "../classes/player";
import DarkOverlay from "../components/DarkOverlay";
import CHARACTERS from '../jsons/characters.json';
import { toast } from 'react-toastify';
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
        const onGameOptionFromHost = () => {
            socket.emit('gameoptions', {
                startpoints: gameoptions.startpoints,
                roomId: gameoptions.roomId,
                gametime: gameoptions.gametime,
                area: gameoptions.area,
                players: [{ name: gameoptions.playername, roomId: gameoptions.roomId, socketId: socket.id }, ...state.players]
            }, (options) => dispatch({ gameoptions: options }));
        }
        socket.on('ongetgameoptions', onGameOptionFromHost);
        if (gameoptions.host) onGameOptionFromHost()
        else {
            // Send a signal to get games options from host
            console.log('Sending signal to get games options from host');
            const roomId = window.location.href.replace("&cancel=true", '').replace(/.*join=/gmi, '');
            socket.emit('get_game_options_from_host', roomId)
        }
        return () => socket.off('ongetgameoptions', onGameOptionFromHost);
    }, [gameoptions, state.players]);




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


    const onCopyGameLink = async () => {

        // get base url
        const url = window.location.href.replace("lobby", 'join');
        const roomId = gameoptions.roomId;

        // create join link - You can use its implementation in App.jsx
        const link = `${url}?join=${roomId}`; // https://battle.cards/join?join=134234234

        // write to clipboard
        await window.navigator.clipboard.writeText(link);

        // alert new that link was copied
        // alert(link);
        toast('Join link has been copied to clipboard')
    }


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
            <DarkOverlay color="#00000077" />
            <KeyboardAudio name={gameoptions.playername} roomId={gameoptions.roomId} />
            <div className="text-white h-screen" style={{ backgroundImage: `url(areas/${gameoptions.area || state.gameoptions.area}.jpeg)`, backgroundSize: '100%', overflow: 'hidden' }}>
                {gameoptions.host ? <button className='relative text-md z-10 px-6 py-2 rounded-sm shadow-xl hover:shadow-2xl bg-pink-700 text-white  hover:bg-amber-700 duration-500 cursor-pointer' onClick={onCancelLobby}>Back</button> : null}
                <h1 className="tablet:text-4xl laptop:text-6xl p-3 z-10 relative">Battle Cards Lobby <i>({state.gameoptions?.players?.length || state.players.length})</i></h1>
                <h6 className="px-3">You: {gameoptions.playername}</h6>

                {/* Game Options */}
                <div className="flex gap-3 py-1 px-8">
                    {/* <div className='text-md z-10 px-6 py-2 rounded-sm shadow-xl hover:shadow-2xl bg-blue-600 duration-150 text-white'>Game Time: <span>{gameoptions.gametime || state.gameoptions.gametime}</span>s</div>
                    <div className='text-md z-10 px-6 py-2 rounded-sm shadow-xl hover:shadow-2xl bg-blue-600 duration-150 text-white'>Start Points: <span>{gameoptions.startpoints || state.gameoptions.startpoints}</span></div> */}
                    {!gameoptions.host ? <button className='text-md z-10 px-6 py-2 rounded-sm shadow-xl hover:shadow-2xl bg-pink-700 text-white  hover:bg-amber-700 duration-500 cursor-pointer' onClick={onCopyGameLink}>Copy Link</button> : null}
                </div>


                {/* Show if the admin/host  */}
                {gameoptions.host ? <div>

                    {/* Join Link */}
                    <div className="w-full flex z-10 relative px-8">
                        <input className="w-full p-4 rounded-s-md text-white bg-[#efefef4d]" disabled={true} value={`${window.location.href.replace("lobby", 'join')}?join=${gameoptions.roomId}`} />
                        <button className="w-48 bg-pink-700 p-4 rounded-e-sm text-white hover:bg-amber-700 duration-500 cursor-pointer" onClick={onCopyGameLink}>Copy Link</button>
                    </div>

                </div> : null}


                {/* Player Icons */}
                <div className="relative z-10 py-2 px-8 flex overflow-x-scroll tablet:w-[600px] laptop:w-[1000px] desktop:w-[1280px]">
                    {state.gameoptions.players.map(p =>
                        <div key={playerIcons.get(p.name).id} className="relative">
                            <img title={p.name} className="phone:w-10 phone:h-10 mobile:w-10 mobile:h-10 tablet:w-10 tablet:h-10 laptop:w-16 laptop:h-16 rounded-full shadow-lg" src={playerIcons.get(p.name).image} />
                            {p.ready ?
                                <span className="relative rounded-2xl bg-slate-800 text-white p-1 text-sm border-2 border-slate-700">Ready</span>
                                : null}
                        </div>
                    )}

                </div>

                {/* Show the chat message */}
                <div className="mobile:h-[200px] mobile:max-h-[300px] phone:h-[200px] phone:max-h-[300px] phone-xl:h-[200px] phone-xl:max-h-[300px] tablet-xl:h-[300px] tablet:max-h-[400px] overflow-y-scroll bg-[#39393962] z-10 relative mx-8 flex flex-col gap-1 p-2">
                    <h6 className="flex gap-2 items-center">
                        <img src="icon.png" alt="battlecards" className="w-8 h-8 rounded-full" />
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
                <form onSubmit={onSendMessageToChat} className="w-full flex z-10 relative px-8 py-3">
                    <input className="w-full p-4 rounded-s-md text-white bg-[#3b3b3b8b]" type="text" required name="chat" maxLength={300} placeholder="Enter your t̶o̶x̶i̶c̶  message here..." />
                    <button className="bg-pink-900 p-2 rounded-e-md text-white hover:bg-purple-700 duration-500 cursor-pointer" type="submit">Send Message</button>
                </form>


                {/* Start Buttons */}
                <div className="flex gap-2 justify-center p-2 z-10 relative">
                    <button
                        style={{ background: ready ? "#831843" : "#be185d" }}
                        className="p-4 rounded-sm cursor-pointer text-white hover:bg-amber-600" onClick={onReady}>
                        {ready ? "Not Ready" : "Ready!"}
                    </button>

                    {/* Only host can start the game. */}
                    {gameoptions.host ?
                        <button
                            style={{ background: (state.players.filter(p => !p.ready).length || !ready) ? "#831843" : "#be185d" }}
                            className="bg-pink-700 p-4 rounded-sm cursor-pointer text-white hover:bg-amber-600"
                            // check if all the players are ready include you
                            disabled={state.players.filter(p => !p.ready).length || !ready}
                            onClick={onStart}>{(state.players.filter(p => !p.ready).length || !ready) ? "Waiting for Ready Players..." : "Start Game"}</button>
                        : null}
                </div>
            </div>
        </div>
    )
}

export default GameLobby