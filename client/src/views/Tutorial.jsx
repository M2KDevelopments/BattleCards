import DarkOverlay from "../components/DarkOverlay";
import PlayingCard from "../components/PlayingCard";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../hooks/useWindowSize";
import { useState, useEffect } from "react";

function Tutorial() {

    const navigate = useNavigate()
    const isDesktop = useWindowSize();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    return (
        <div 
            style={{ 
                backgroundImage: isDesktop ? `url('/battlecards.jpg')` : `url('/battlecards_phone.jpg')`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflow: 'hidden' 
            }} 
            className="h-screen flex flex-col items-center relative"
        >
            <DarkOverlay color="rgba(0, 0, 0, 0.7)" />
            
            {/* Back Button */}
            <button 
                className={`group relative z-10 mt-6 text-xl rounded-2xl px-8 py-3 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center justify-center ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                onClick={() => navigate('/')}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-pink-700 transition-transform duration-300 group-hover:scale-110"></div>
                <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"></div>
                <span className="relative text-white font-bold tracking-wide drop-shadow-lg leading-none">← Back To Main Menu</span>
            </button>

            {/* Content Container */}
            <div className={`text-white relative z-10 overflow-y-scroll px-6 py-6 max-w-6xl w-full transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
                        How to Play the Game
                    </h1>
                    <div className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/30 shadow-2xl">
                        <p className="text-lg md:text-2xl leading-relaxed">
                            The point of the game is to make your opponent pick as many cards as possible before the game ends. Think of it as you&apos;re playing Uno with a twist - you want your opponent to suffer the most at the very end of the game. Which brings us to our first point:
                        </p>
                    </div>
                </div>

                {/* Game Modes Section */}
                <div className="mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        🎮 Game Modes
                    </h2>
                    <div className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-xl">
                        <p className="text-lg md:text-xl leading-relaxed">
                            There are three game modes in Battle Cards: <b className="text-pink-400">Light Mode</b>, <b className="text-purple-400">Dark Mode</b>, and <b className="text-red-400">Battle Mode</b>. Light mode is similar to the normal way of playing Uno. Dark mode is the same but the cards that you pick are much more intense. Battle mode is the key mode that the game was built on. This mode is entered when a card that is intended for someone to pick is thrown on the table. The key aspect of battle mode is to accumulate the number of cards to pick for someone to suffer. All other cards that are functional like reversing the flow of the game or skipping someone can be used in battle mode as defenses to avoid you picking. There are other special cards that are also used as defense, which is what we&apos;re going to get into next.
                        </p>
                    </div>
                </div>

                {/* Cards Section */}
                <div className="mb-8">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                        🃏 Cards
                    </h2>
                </div>
                <div className="flex gap-2">
                    <PlayingCard
                        title="Number Cards"
                        isDark={false}
                        color="red">
                        <img className="w-10 h-10" src="/cards/1red.png" />
                    </PlayingCard>

                    <PlayingCard
                        title="Number Cards"
                        isDark={false}
                        color="orange">
                        <img className="w-10 h-10" src="/cards/4orange.png" />
                    </PlayingCard>

                    <PlayingCard
                        title="Number Cards"
                        isDark={false}
                        color="blue">
                        <img className="w-10 h-10" src="/cards/7blue.png" />
                    </PlayingCard>

                    <PlayingCard
                        title="Number Cards"
                        isDark={false}
                        color="green">
                        <img className="w-10 h-10" src="/cards/9green.png" />
                    </PlayingCard>
                </div>
                <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-red-500/20">
                    <p className="text-lg md:text-xl">These are normal number cards that are used when the game is in a neutral state.</p>
                </div>


                <div className="flex gap-2">
                    <PlayingCard
                        title="Color Reverse"
                        isDark={false}
                        color="green">
                        <img className="w-10 h-10" src="/cards/reverse-green.png" />
                    </PlayingCard>

                    <PlayingCard
                        title="Color Reverse"
                        isDark={false}
                        color="orange">
                        <img className="w-10 h-10" src="/cards/reverse-orange.png" />
                    </PlayingCard>

                    <PlayingCard
                        title="Color Reverse"
                        isDark={false}
                        color="red">
                        <img className="w-10 h-10" src="/cards/reverse-red.png" />
                    </PlayingCard>

                    <PlayingCard
                        title="Color Reverse"
                        isDark={false}
                        color="blue">
                        <img className="w-10 h-10" src="/cards/reverse-blue.png" />
                    </PlayingCard>
                </div>
                <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-green-500/20">
                    <p className="text-lg md:text-xl"><b className="text-green-400">Color Reverse Card:</b> This is a reverse card that changes the direction of the game. This card can only be thrown if there is a similar color on the table or a reverse on the table and <b className="text-yellow-400">requires</b> a supporting card. If you&apos;re in battle mode this card can be thrown at any time to reverse the effects of you picking.</p>
                </div>


                <div className="flex gap-2">
                    <PlayingCard
                        title="Reverse"
                        isDark={false}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/reverse.png" />
                    </PlayingCard>
                </div>
                <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/30 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-500/20">
                    <p className="text-lg md:text-xl"><b className="text-purple-400">Reverse Card:</b> This is similar to the color reverse card but it can be thrown at any time. This <b className="text-red-400">DOES NOT</b> require a supporting card.</p>
                </div>

                <div className="flex gap-2">
                    <PlayingCard
                        title="Skip"
                        isDark={false}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/jump.png" />
                    </PlayingCard>
                    <PlayingCard
                        title="Skip"
                        isDark={false}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/jump-battle.png" />
                    </PlayingCard>
                </div>
                <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-yellow-500/20">
                    <p className="text-lg md:text-xl"><b className="text-yellow-400">Skip Card:</b> Can be used to skip someone&apos;s turn, but when you&apos;re in battle mode it skips you from picking.</p>
                </div>

                <div className="flex gap-2">
                    <PlayingCard
                        title="I want card"
                        isDark={false}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/iwant.png" />
                    </PlayingCard>
                    <PlayingCard
                        title="I want card"
                        isDark={false}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/iwant-battle.png" />
                    </PlayingCard>
                </div>
                <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-cyan-500/20">
                    <p className="text-lg md:text-xl"><b className="text-cyan-400">I Want Card:</b> Forces the next player to throw a card of a color of your choosing. However, this does not prevent them from throwing a card that forces someone else to pick or another I want card. In battle mode, this card turns into the number skip card - it skips the player that threw it from picking and gives the opportunity for the other player to throw any number card to skip the number of players from picking and falls on where it lands.</p>
                </div>



                <div className="flex gap-2">
                    <PlayingCard
                        title="Flip"
                        isDark={false}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/flip.png" />
                    </PlayingCard>
                    <PlayingCard
                        title="Flip"
                        isDark={true}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/flip.png" />
                    </PlayingCard>
                </div>
                <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-indigo-500/20">
                    <p className="text-lg md:text-xl"><b className="text-indigo-400">Flip Card:</b> Used to change the game from light mode to dark mode. It can be thrown at any time, even during battle mode.</p>
                </div>


                <div className="flex gap-2">
                    <PlayingCard
                        title="Pick"
                        isDark={false}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/plus2.gif" />
                    </PlayingCard>
                    <PlayingCard
                        title="Pick"
                        isDark={false}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/plus4.gif" />
                    </PlayingCard>

                    <PlayingCard
                        title="Pick"
                        isDark={true}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/plus5.gif" />
                    </PlayingCard>
                    <PlayingCard
                        title="Pick"
                        isDark={true}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/plus10.gif" />
                    </PlayingCard>
                </div>
                <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-4 mb-10 border border-red-500/30 shadow-lg">
                    <p className="text-lg md:text-xl"><b className="text-red-400">Battle Cards:</b> These are the cards that initiate battle mode and cause the other player to pick cards. They range in value starting from <b className="text-pink-400">+2 to +4</b> in light mode and <b className="text-red-400">+5 to +10</b> in dark mode. If thrown in battle mode, the cards to pick accumulate.</p>
                </div>

                {/* Rules Section */}
                <div className="mb-8">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        📜 Rules of the Game
                    </h2>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                        <p className="text-lg md:text-xl leading-relaxed">
                            ⏱️ <b className="text-blue-400">Game Duration:</b> The average game is about 300 seconds (5 minutes). When the game begins, after 30 seconds the timer stops showing and will appear again when the game is left to its last minute. This is done so that players don&apos;t know the amount of time that has passed.
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                        <p className="text-lg md:text-xl leading-relaxed">
                            💎 <b className="text-purple-400">Point System:</b> Each player starts with a designated amount of points (e.g., 1,000). When the game ends, these points are deducted based on the cards you have in hand. The points of each card are shown at the end of each game under the <b className="text-pink-400">Results</b> section. Picking cards are worth 10× their value, defensive cards used in battle mode are worth 15 points, and number cards are worth their face value. Ideally, you want to have as low a value as possible at the end of the game.
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
                        <p className="text-lg md:text-xl leading-relaxed">
                            🏁 <b className="text-orange-400">How the Game Ends:</b> There are only three ways the game can end:
                        </p>
                        <ul className="list-disc list-inside mt-3 space-y-2 text-lg md:text-xl ml-4">
                            <li>Someone finishes the game (can only be finished with a number card)</li>
                            <li>The timer runs out and you&apos;re not in battle mode</li>
                            <li>The timer runs out while in battle mode and the person picks</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
                        <p className="text-lg md:text-xl leading-relaxed">
                            🎤 <b className="text-green-400">Voice Lines:</b> The numpad keys are used to send voice lines during the game. You can only play these during your turn, and they&apos;re used to troll your opponents - so have fun with it! Each character has four voice lines.
                        </p>
                    </div>
                </div>

                <div className="my-8 border-t-2 border-purple-500/30"></div>

                <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/30 shadow-2xl text-center">
                    <p className="text-xl md:text-2xl font-bold leading-relaxed">
                        ⚔️ So there you have it - those are the rules for Battle Cards. <br/>
                        <span className="text-pink-400">I wish you well in your battle!</span> 🎮
                    </p>
                </div>

            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-purple-500 opacity-20 rounded-tl-3xl pointer-events-none"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-pink-500 opacity-20 rounded-tr-3xl pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-pink-500 opacity-20 rounded-bl-3xl pointer-events-none"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-purple-500 opacity-20 rounded-br-3xl pointer-events-none"></div>
        </div>
    )
}

export default Tutorial