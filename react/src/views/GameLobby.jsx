import { useContext, useEffect, useReducer, useState } from "react";
import { ContextData, PAGE_GAME, socket } from "../App";
import Loading from "../components/Loading";
import Player from "../classes/player";
7
function GameLobby() {

    // get gameoptions that were saved from GameOptions Page in global variable
    const { gameoptions, setPage, setGameOptions } = useContext(ContextData);


    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(10);

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
            const index = state.players.findIndex(p => p.socketId == action.socketId);
            if (index !== -1) state.players[index].ready = action.ready;// update ready state
            return { ...state };
        }


        if (action.chat) { // adding a new chat message
            return { ...state, chats: [...state.chats, action.chat] };
        }

        if (action.player) { // adding a new player
            return { ...state, players: [...state.players, action.player] };
        }

        return state;
    }

    const [state, dispatch] = useReducer(reducer, { chats: [], players: [] })


    // Listen for web sockets emits from server
    useEffect(() => {

        // when message comes in data = {chat: {name, message}}
        socket.on('onchat', (data) => dispatch({ chat: data.chat }));

        // when player joins room
        socket.on('onjoin', (data) => dispatch({ player: data }));

        // when player joins room
        socket.on('onready', (data) => dispatch({ ready: data.ready, socketId: data.socketId }));

        // when player disconnects from server
        socket.on('ondisconnected', (socketId) => dispatch({ disconnected: socketId }))

        // there a count down timer in the backend so this will listen for the each second on the count down
        socket.on('onloadgame', (data) => {
            const {
                countdown,
                players,
                area,
                gametime,
                cards, // {lightCards, darkCards}
                cardIndexOnTable,
                startpoints
            } = data;

            // start the defining game settings when player option shows up
            if (players) {

                const game = {
                    ...cards, // lightCards, darkCards
                    area,
                    gametime,
                    startpoints,
                    cardIndexOnTable,
                    players: players.map(p => new Player(p.id, p.name, p.npc, startpoints, p.cards))
                }

                // setup the game options for each player
                dispatch({ game });
            }

            setCountdown(countdown);

            // start loading
            setLoading(true);
        })
    }, []);


    // Waiting for game to start
    useEffect(() => {
        // start the game
        if (countdown === 0) setPage(PAGE_GAME)
    }, [countdown, setPage])


    const onCopyGameLink = async () => {

        // get base url
        const url = window.location.href;
        const roomId = gameoptions.roomId;

        // create join link - You can use its implementation in App.jsx
        const link = `${url}#join${roomId}`; // https://battle.cards#join134234234

        // write to clipboard
        await window.navigator.clipboard.writeText(link);

        // alert new that link was copied
        alert(link);
    }


    const onSendMessageToChat = (e) => {
        //prevenet form for submitting and refreshing
        e.preventDefault();

        // get message
        const message = e.target.chat.value;

        // send message via websockets to a room
        socket.emit('chat', { name: gameoptions.playername, message: message, roomId: gameoptions.roomId }, dispatch);
    }

    const onReady = () => {
        // send to server that you are ready, setReady is the callback that is called
        // everything is done successfully
        socket.emit('ready', { ready: ready, roomId: gameoptions.roomId }, setReady)
    }


    const onStart = () => {
        // show loading animations
        socket.emit('loadgame', {
            ...gameoptions,
            players: state.players,
        }, () => setLoading(true));
    }


    if (loading) return <Loading countDown={countdown} />


    return (
        <div>
            <img src="logo.svg" width={100} alt="Battle Cards" />
            <h1>Battle Cards Lobby</h1>

            {/* Show if the admin/host  */}
            {gameoptions.host ? <div>
                <button onClick={onCopyGameLink}>Copy Join Link</button>

                <h4 title={state.players.map(p => p.name).join("\n")}>
                    {gameoptions.npcs.length + 1 + state.players.length} Player(s) In Chats
                </h4>

                {/* Players */}
                <h6>You</h6>
                {gameoptions.npcs.map(name => <h6 key={name}>{name}</h6>)}
                {state.players.map((player) =>
                    <h6 key={player.socketId}>
                        {player.name} {player.ready ? `(Ready!)` : ``}
                    </h6>
                )}


            </div> : <button onClick={onCopyGameLink}>Copy Invite Link</button>}

            {/* Show the chat message */}
            <div style={{ height: 400, maxHeight: 400, overflowY: 'scroll', background: "lightgrey" }}>
                {state.chats.map((chat, index) => <h6 key={index}>{chat.name}: {chat.message}</h6>)}
            </div>

            {/* Submit a message to the lobby */}
            <form onSubmit={onSendMessageToChat}>
                <input type="text" required name="chat" maxLength={300} placeholder="Message Chat" />
                <button type="submit">Send</button>
            </form>

            <button onClick={onReady}>{ready ? "Not Ready" : "Ready!"}</button>

            {/* Only host can start the game. */}
            {gameoptions.host ?
                <button
                    // check if all the players are ready include you
                    disabled={state.players.filter(p => !p.ready).length || !ready}
                    onClick={onStart}>Start Game</button>
                : null}
        </div>
    )
}

export default GameLobby