import { useContext, useState } from "react";
import { ContextData, PAGE_GAME } from "../App";
import Loading from "../components/Loading";

function GameLobby() {

    // get gameoptions that were saved from GameOptions Page in global variable
    const { gameoptions, setPage } = useContext(ContextData);
    const [chats, setChats] = useState([]);
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);


    const onSendMessageToChat = (e) => {
        //prevenet form for submitting and refreshing
        e.preventDefault();

        // get message
        const message = e.target.chat.value;

        //add to array and react's useState
        chats.push(message);
        setChats([...chats]);
    }

    const onReady = () => {
        setReady(!ready); // toggle ready state
    }


    const onStart = () => {

        // show loading animations
        setLoading(true);

        // Run this function after a certain amount of time
        const secondsToWait = 5;
        setTimeout(() => {
            // start the game
            setPage(PAGE_GAME);
        }, secondsToWait * 1000)

    }

    if (loading) return <Loading />

    return (
        <div>
            <img src="logo.svg" width={100} alt="Battle Cards" />
            <h1>Battle Cards Lobby</h1>

            <h4>{gameoptions.npcs.length + 1} Player(s) In Chats</h4>
            <h6>You</h6>
            {gameoptions.npcs.map(name => <h6 key={name}>{name}</h6>)}

            {/* Show the chat message */}
            <div style={{ height: 400, maxHeight: 400, overflowY: 'scroll', background: "lightgrey" }}>
                {chats.map((message, index) => <h6 key={index}>{message}</h6>)}
            </div>

            {/* Submit a message to the lobby */}
            <form onSubmit={onSendMessageToChat}>
                <input type="text" required name="chat" maxLength={300} placeholder="Message Chat" />
                <button type="submit">Send</button>
            </form>

            <button onClick={onReady}>{ready ? "Not Ready" : "Ready!"}</button>

            {ready ? <button onClick={onStart}>Start Game</button> : null}
        </div>
    )
}

export default GameLobby