import DarkOverlay from "../components/DarkOverlay";
import { ContextData, PAGE_MENU, } from "../App";
import { useContext } from "react";
import PlayingCard from "../components/PlayingCard";


function Tutorial() {
    const { setPage } = useContext(ContextData);
    return (
        <div style={{ backgroundImage: `url('/battlecards.jpg')`, backgroundSize: '100%', overflow: 'hidden' }} className="h-screen flex flex-col gap-4 justify-center items-center align-middle m-auto">
            <DarkOverlay />
            <button className='z-10 text-3xl rounded-md mobile:px-8 phone:px-8 tablet:px-16 laptop:px-20 py-2 border-2 border-purple-300 bg-pink-700 hover:bg-pink-900 duration-200 text-white' onClick={() => setPage(PAGE_MENU)}>Back To Main Menu</button>
            <div className="text-white relative z-10 overflow-y-scroll px-6">
                <h1 className="mobile:text-4xl phone:text-4xl tablet:text-7xl">How to play the game</h1>
                <p className="mobile:text-lg phone:text-lg tablet:text-2xl mb-10">The point of the game is to make your opponent pick as many cards as possible before the game ends. Of it as you&apos;re playing Uno with a Twist that you want your opponent to suffer the most at the very end of the game. Which brings us to our first point; </p>

                <h1>Game modes </h1>
                <p className="mobile:text-lg phone:text-lg tablet:text-2xl mb-10">There are three game modes in battle cards first we have light mode, dark mode and battle mode. Light mode is similar to the normal way of playing Uno, dark mode is the same but the cards that you pick a much more.. Battle mode on the other hand this is the key mode that the game was built on. This mode is entered when a card that is intended for someone to pick is thrown on the table. The key aspect of battle mode is to accumulate the number of cards to pick for someone to suffer. All other cards that are functional like reversing the flow of the game or skipping someone can be used in battle mode as defenses to avoid you picking. There are other special cards that are also used as defense and which is what we&apos;re going to get into next. </p>

                <h1>Cards </h1>
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
                <p className="mobile:text-lg phone:text-lg tablet:text-2xl">These are normal number cards that are used when the game is in a neutral state. </p>


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
                <p className="mobile:text-lg phone:text-lg tablet:text-2xl"><b>Color Reverse Card:</b> This is a reverse card that changes the direction of the game. This card can only be thrown if there is a similar color on the table or a reverse on the table and <b>requires</b> a supporting card. If you&apos;re in battle mode this card can be thrown at any time to reverse the effects of you picking. </p>


                <div className="flex gap-2">
                    <PlayingCard
                        title="Reverse"
                        isDark={false}
                        color="grey">
                        <img className="w-10 h-10" src="/cards/reverse.png" />
                    </PlayingCard>
                </div>
                <p className="mobile:text-lg phone:text-lg tablet:text-2xl"><b>Reverse Card:</b>This is similar to the color reverse card but it can be thrown at any time. This <b>DOES NOT</b> require a supporting card</p>

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
                <p className="mobile:text-lg phone:text-lg tablet:text-2xl">The Skip Card that can be used to skip someone&apos;s turn but when you&apos;re in battle mode it skips you from picking. </p>

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
                <p className="mobile:text-lg phone:text-lg tablet:text-2xl">The I want card forces the next player to throw card of a color of your choosing. However this does not prevent them from throwing a card that forces someone else to pick or another I want card. In battle mode this car turns into the number skip card and what this card does if it is thrown down it skips the player that threw it down from picking and gives the opportunity for the other player to throw any number card to skip the number of players from picking and falls on where it lands. </p>



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
                <p className="mobile:text-lg phone:text-lg tablet:text-2xl">The flip card is used to change the game from light mode to dark mode it can be thrown at any time even during battle mode.</p>


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
                <p className="mobile:text-lg phone:text-lg tablet:text-2xl mb-10">Battle Cards are the cards that initiate battle mode and cause the other player to pick cards. They range in value starting from 2 to 4 in light mode and 5 and 10 in dark mode. If thrown in battle mode the cards to pick accumulate.</p>

                <h1>Rules of the game  </h1>

                <p className="mobile:text-lg phone:text-lg tablet:text-2xl">The average game is about 300 seconds which is about 5 minutes. When the game begins after 30 seconds the timer stops showing and will appear again when the game is left to its last minute. This is done so that the players don&apos;t know the amount of time that has been passed.
                </p>

                <p className="mobile:text-lg phone:text-lg tablet:text-2xl">Each player starts with a designated amount of points let&apos;s say for example 1,000 and the game ends these points are deducted based on the cards that you have in hand the points of each card are shown at the end of each game under the <b>Results</b> section. The picking cards are about times 10 the value and each card that is used as a defensive option in battle mode as a value of 15 and the number cards are the same exact value as the number. So ideally at the end of the game you want to have as low of a value as possible.
                </p>

                <p className="mobile:text-lg phone:text-lg tablet:text-2xl">How the game ends. They are only three ways the game can end first is if someone finishes the game and the game can only be finished with a number card second is if the timer runs out and you&apos;re not in battle mode and lastly is if the timer runs out and you&apos;re in battle mode and the person picks.
                </p>

                <p className="mobile:text-lg phone:text-lg tablet:text-2xl mb-10">The numpad keys are used to send voice lines during the game you can only play this during your turn and it&apos;s used to troll your opponents so have fun with it. Each character has four voice lines.</p>

                <hr />

                <p className="mobile:text-lg phone:text-lg tablet:text-2xl">So there you have it those are the rules for battle cards I wish you well in your battle.
                </p>

            </div>
        </div>
    )
}

export default Tutorial