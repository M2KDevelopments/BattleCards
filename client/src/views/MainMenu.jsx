import DarkOverlay from "../components/DarkOverlay";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../hooks/useWindowSize";
import { useState, useEffect } from "react";

function MainMenu() {

  const navigate = useNavigate();
  const isDesktop = useWindowSize();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // From Game Audio component
  function playGameMusic() {
    const audio = document.getElementById("main-audio");
    audio.volume = 0.08;
    audio.play();
  }

  return (
    <div 
      style={{ 
        backgroundImage: isDesktop ? `url('/battlecards.jpg')` : `url('/battlecards_phone.jpg')`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden' 
      }} 
      className="h-screen flex flex-col gap-6 justify-center items-center align-middle m-auto relative"
    >
      <DarkOverlay color="rgba(0, 0, 0, 0.6)" />
      
      {/* Animated Logo Container */}
      <div className={`relative z-10 flex flex-col items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        {/* Glowing Logo Background */}
        <div className="absolute inset-0 blur-3xl bg-purple-500 opacity-30 animate-pulse"></div>
        
        {/* Logo */}
        <img 
          className="relative drop-shadow-2xl animate-float" 
          src="logo.png" 
          width={isDesktop ? 450 : 250} 
          alt="Battle Cards Logo" 
        />
        
        {/* Title Image with Glow Effect */}
        {/* <div className="relative">
          <div className="absolute inset-0 blur-xl bg-pink-500 opacity-40"></div>
          <img 
            className={`relative ${isDesktop ? 'h-48' : 'h-20'} drop-shadow-2xl`}
            src="battlecards-text.png" 
            alt="Battle Cards" 
          />
        </div> */}
      </div>

      {/* Menu Buttons Container */}
      <div className={`z-10 flex flex-col gap-4 w-full max-w-md px-4 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* How to Play Button */}
        <button 
          className="group relative w-full text-2xl md:text-3xl rounded-2xl px-8 py-4 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
          onClick={() => navigate('/tutorial')}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-700 to-red-800 transition-transform duration-300 group-hover:scale-110"></div>
          
          {/* Border Glow Effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-50 group-hover:opacity-100 group-hover:border-purple-300 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"></div>
          
          {/* Button Text */}
          <span className="relative text-white font-bold tracking-wide drop-shadow-lg">
            How to Play
          </span>
        </button>

        {/* Create Game Button */}
        <button 
          className="group relative w-full text-2xl md:text-3xl rounded-2xl px-8 py-4 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
          onClick={() => { playGameMusic(); navigate('/options') }}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-pink-700 to-purple-700 transition-transform duration-300 group-hover:scale-110"></div>
          
          {/* Border Glow Effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-50 group-hover:opacity-100 group-hover:border-pink-300 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]"></div>
          
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          {/* Button Text */}
          <span className="relative text-white font-bold tracking-wide drop-shadow-lg">
            Create Game
          </span>
        </button>

        {/* Join Game Button */}
        <button 
          className="group relative w-full text-2xl md:text-3xl rounded-2xl px-8 py-4 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
          onClick={() => { playGameMusic(); navigate('/available') }}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-700 to-pink-800 transition-transform duration-300 group-hover:scale-110"></div>
          
          {/* Border Glow Effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-50 group-hover:opacity-100 group-hover:border-pink-300 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]"></div>
          
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          {/* Button Text */}
          <span className="relative text-white font-bold tracking-wide drop-shadow-lg">
            Join Game
          </span>
        </button>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-4 left-4 w-20 h-20 border-t-4 border-l-4 border-purple-500 opacity-30 rounded-tl-3xl"></div>
      <div className="absolute top-4 right-4 w-20 h-20 border-t-4 border-r-4 border-pink-500 opacity-30 rounded-tr-3xl"></div>
      <div className="absolute bottom-4 left-4 w-20 h-20 border-b-4 border-l-4 border-pink-500 opacity-30 rounded-bl-3xl"></div>
      <div className="absolute bottom-4 right-4 w-20 h-20 border-b-4 border-r-4 border-purple-500 opacity-30 rounded-br-3xl"></div>
    </div>
  )

}

export default MainMenu