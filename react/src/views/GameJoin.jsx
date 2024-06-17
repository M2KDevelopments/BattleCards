import { useContext, useState } from "react";
import { ContextData, PAGE_GAMELOBBY, socket } from "../App";



// eslint-disable-next-line react/prop-types
function GameJoin({ joinRoomId }) {

    // get gameoptions that were saved from GameOptions Page in global variable
    const { setGameOptions, setPage } = useContext(ContextData);

    const [playername, setPlayername] = useState("");


    // send message to server websocket for this player to join room.
    const onJoin = () => {
        if (playername.trim() == "") return alert('Please enter playername');

        socket.emit('join', { name: playername, roomId: joinRoomId }, () => {
            console.log(`I've joined the room`);
            setGameOptions({ playername: playername, roomId: joinRoomId });
            setPage(PAGE_GAMELOBBY);
        });
    }

    return (
        <div>
            <img src="logo.svg" width={100} alt="Battle Cards" />
            <h1>Battle Cards Join Room</h1>

            <h6>Player Name</h6>
            <input type='name' placeholder='Player Name' value={playername} onChange={e => setPlayername(e.target.value)} />

            <button onClick={onJoin}>Join Game</button>
        </div>
    )
}

export default GameJoin