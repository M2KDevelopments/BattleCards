import { useEffect, useMemo, useState } from "react"
import { socket } from "../App";
import CHARACTERS from '../jsons/characters.json';
import DarkOverlay from "../components/DarkOverlay";
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';

function AvailableGames() {

    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();


    const availableGames = useMemo(() => {
        return rooms.map(room => {
            // eslint-disable-next-line no-useless-escape
            const playername = room.split("__")[1].replace(/\-\-/, ' ')
            const image = `banners/${CHARACTERS.find(c => c.name == playername).id}.png`
            return { playername, image, roomId: room };
        })
    }, [rooms])


    // Get all available rooms
    useEffect(() => {
        socket.emit('rooms', {})
        socket.on('onrooms', setRooms)
        return () => socket.off('onrooms', setRooms)
    }, [])


    const onRefresh = () => socket.emit('rooms', {})
    const onJoin = async (roomId, playname) => {
        const result = await swal({
            title: `Join ${playname}'s Game`,
            text: `Do you want to join this ${playname}'s game: ${roomId}`,
            info: 'info',
            buttons: ['No', 'Yes']
        });
        if (result) navigate(`/join?join=${roomId}`)
    }


    return (
        <div>
            <DarkOverlay color="#00000077" />
            <div className="h-screen flex flex-col items-center py-10 gap-2 overflow-hidden" style={{ backgroundImage: `url(join.png)`, backgroundSize: '100%', overflow: 'hidden' }}>
                <img src="logo.png" width={100} alt="Battle Cards" />
                <h1 className="tablet:text-4xl laptop:text-6xl p-3 z-10 relative text-white">Battle Cards Available Games</h1>

                <section className='px-4 flex flex-col gap-3 justify-center mx-auto h-screen my-auto content-center items-center align-middle'>
                    {availableGames.length ?

                        // List of Games
                        <div className="grid mobile:grid-cols-2 phone:grid-cols-3 phone-xl:grid-cols-4 tablet:grid-cols-5 tablet-xl:grid-cols-6 gap-2 w-full z-20">
                            {availableGames.map(game =>
                                <button onClick={() => onJoin(game.roomId, game.playername)} key={game.roomId} title={`${game.playername}'s Game`} className="flex items-center gap-4 bg-gray-700 text-white p-2 rounded-3xl shadow-md shadow-white duration-300 hover:shadow-2xl">
                                    <div className="rounded-full bg-white">
                                        <img src={game.image} alt={game.playername} className="w-20" />
                                    </div>
                                    {game.playername}&apos;s Game
                                </button>
                            )}
                        </div>
                        :
                        // No Games
                        <div className="z-20 flex flex-col">
                            <span className="tablet:text-2xl laptop:text-6xl p-3 z-10 relative text-white">No Available Games</span>
                            <button onClick={onRefresh} className="z-10 text-3xl rounded-md px-8 py-2 border-2 border-purple-300 bg-red-700 hover:bg-red-900 duration-200 text-white">Refresh</button>
                        </div>
                    }
                </section>
            </div>
        </div>

    )
}

export default AvailableGames