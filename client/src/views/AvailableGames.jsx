import { useEffect, useMemo, useState } from "react"
import { socket } from "../App";
import CHARACTERS from '../jsons/characters.json';
import DarkOverlay from "../components/DarkOverlay";
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';
import useWindowSize from "../hooks/useWindowSize";


function AvailableGames() {

    const [rooms, setRooms] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();
    const isDesktop = useWindowSize();

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
        setTimeout(() => setIsLoaded(true), 100);
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
            <DarkOverlay color="rgba(0, 0, 0, 0.7)" />
            <div className="h-screen flex flex-col items-center py-10 gap-6 overflow-hidden relative" style={{ backgroundImage: isDesktop ? `url(join.jpg)` : `url(join_phone.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}>
                
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
                            Available Games
                        </h1>
                    </div>
                </div>

                {/* Refresh Button */}
                <button 
                    className={`group relative text-lg z-10 px-8 py-3 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    onClick={onRefresh}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-700 transition-transform duration-300 group-hover:scale-110"></div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
                    <span className="relative text-white font-bold drop-shadow-lg">🔄 Refresh Games</span>
                </button>

                <section className={`px-6 flex flex-col gap-6 justify-center mx-auto flex-1 content-center items-center align-middle overflow-y-auto max-w-7xl w-full transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    {availableGames.length ?

                        // List of Games
                        <div className="grid mobile:grid-cols-1 phone:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 gap-4 w-full z-20">
                            {availableGames.map((game, index) =>
                                <button 
                                    onClick={() => onJoin(game.roomId, game.playername)} 
                                    key={game.roomId} 
                                    title={`Join ${game.playername}'s Game`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className="group relative overflow-hidden rounded-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-fade-in"
                                >
                                    {/* Background Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-purple-900/80 backdrop-blur-sm transition-all duration-300 group-hover:from-purple-800/90 group-hover:via-pink-800/90 group-hover:to-purple-800/90"></div>
                                    
                                    {/* Border Glow */}
                                    <div className="absolute inset-0 rounded-2xl border-2 border-purple-400/50 group-hover:border-pink-400 transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(236,72,153,0.6)]"></div>
                                    
                                    {/* Content */}
                                    <div className="relative flex flex-col items-center gap-4 p-6">
                                        {/* Character Avatar */}
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-pink-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl transform transition-transform duration-300 group-hover:scale-110">
                                                <img src={game.image} alt={game.playername} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        
                                        {/* Player Name */}
                                        <div className="text-center">
                                            <p className="text-xl font-bold text-white drop-shadow-lg mb-1">{game.playername}</p>
                                            <p className="text-sm text-pink-300 font-semibold">🎮 Host's Game</p>
                                        </div>
                                        
                                        {/* Join Badge */}
                                        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.8)]">
                                            Click to Join
                                        </div>
                                    </div>
                                </button>
                            )}
                        </div>
                        :
                        // No Games
                        <div className="z-20 flex flex-col items-center gap-6 my-auto">
                            <div className="bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-purple-900/60 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/40 shadow-2xl text-center">
                                <div className="text-6xl mb-4">🎲</div>
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">No Available Games</h2>
                                <p className="text-lg md:text-xl text-purple-200">Be the first to create a game!</p>
                            </div>
                            <button 
                                onClick={() => navigate('/options')} 
                                className="group relative text-2xl z-10 px-12 py-4 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-pink-700 to-red-700 transition-transform duration-300 group-hover:scale-110"></div>
                                <div className="absolute inset-0 rounded-2xl border-2 border-pink-400 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="relative text-white font-bold drop-shadow-lg">🎮 Create Game</span>
                            </button>
                        </div>
                    }
                </section>
            </div>
        </div>

    )
}

export default AvailableGames