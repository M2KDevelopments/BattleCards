import { useEffect } from "react";
import CHARACTERS from '../jsons/characters.json';
import { socket } from "../App";
import { toast } from 'react-toastify';

// eslint-disable-next-line react/prop-types
function KeyboardAudio({ name, roomId, turnbased, myturn }) {


    useEffect(() => {
        function onAudio(playerId, name, num) {
            const audio = new Audio(`audio/${playerId}${num}.mp3`);
            audio.play();
            audio.onended = () => audio.remove();
            toast(`${name} is speaking`);
        }
        socket.on('onaudio', onAudio);
        return () => socket.off('onaudio', onAudio);
    }, []);



    useEffect(() => {
        document.body.onkeydown = (e) => {
            const player = CHARACTERS.find(n => n.name == name);
            if (['1', '2', '3', '4'].includes(e.key)) {
                if (turnbased && !myturn) return toast.warning('You can only use voice lines when its your turn');
                else if ((turnbased && myturn) || (!turnbased && !myturn)) {
                    const audio = new Audio(`audio/${player.id}${e.key}.mp3`);
                    audio.play();
                    audio.onended = () => audio.remove();
                    if (roomId) socket.emit('audio', { playerId: player.id, name, num: e.key, roomId });
                }
            }
        }
    }, [name, roomId, turnbased, myturn]);

    return null;
}

export default KeyboardAudio