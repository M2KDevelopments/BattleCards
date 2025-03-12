import DarkOverlay from "../components/DarkOverlay";
import { useNavigate } from "react-router-dom";


function MainMenu() {

  const navigate = useNavigate();

  // From Game Audio component
  function playGameMusic() {
    const audio = document.getElementById("main-audio");
    audio.volume = 0.08;
    audio.play();
  }

  return (
    <div style={{ backgroundImage: `url('/battlecards.jpg')`, backgroundSize: '100%', overflow: 'hidden' }} className="h-screen flex flex-col gap-4 justify-center items-center align-middle m-auto">
      <DarkOverlay />
      <img className="text-center opacity-40" src="logo.png" width={300} alt="Battle Cards" />
      {/* <h1 className="z-10 text-center tablet:text-4xl laptop:text-7xl text-white font-bold">Battle Cards</h1> */}
      <img className="text-center tablet:h-20 laptop:h-48 relative z-10" src="battlecards-text.png" alt="Battle Cards" />
      <button className="z-10 text-3xl rounded-md px-8 py-2 border-2 border-purple-300 bg-red-700 hover:bg-red-900 duration-200 text-white" onClick={() => navigate('/tutorial')}>How to Play</button>
      <button className="z-10 text-3xl rounded-md px-8 py-2 border-2 border-purple-300 bg-pink-700 hover:bg-pink-900 duration-200 text-white" onClick={() => { playGameMusic(); navigate('/options') }}>Start Battle Cards</button>
      <button className="z-10 text-3xl rounded-md px-8 py-2 border-2 border-purple-300 bg-pink-700 hover:bg-pink-900 duration-200 text-white" onClick={() => { playGameMusic(); navigate('/available') }}>Join Game</button>
    </div>
  )

}

export default MainMenu