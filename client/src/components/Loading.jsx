import { useEffect, useState } from 'react';
import DarkOverlay from "./DarkOverlay"

/* eslint-disable react/prop-types */
function Loading({ area, countDown }) {
  const [progress, setProgress] = useState(0);
  
  // Animate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (countDown * 5));
        return newProgress > 90 ? 90 : newProgress; // Cap at 90% until fully loaded
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [countDown]);

  // When countdown is about to finish, complete the progress
  useEffect(() => {
    if (countDown <= 1) {
      setProgress(100);
    }
  }, [countDown]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <DarkOverlay color="rgba(0, 0, 0, 0.75)" />
      
      {/* Background with parallax effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{
          backgroundImage: `url(areas/${area}.jpeg)`,
          transform: 'scale(1.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 via-pink-900/70 to-purple-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
        {/* Logo with animation */}
        <div className="relative mb-8 animate-float">
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-50 blur-xl animate-pulse"></div>
          <img 
            src="logo.png" 
            alt="Battle Cards" 
            className="relative z-10 w-48 sm:w-56 md:w-64 lg:w-72 drop-shadow-2xl"
          />
        </div>

        {/* Loading Text */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
          Battle Cards
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-pink-200 mb-6">
          Starting in <span className="text-yellow-300 font-bold">{countDown}s</span>
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="relative h-2.5 bg-purple-900/50 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 w-3 h-3 -mt-1.5 bg-white rounded-full shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-pink-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
                animationIterationCount: 'infinite'
              }}
            />
          ))}
        </div>

        {/* Hint Text */}
        <p className="mt-8 text-sm sm:text-base text-pink-200/70 max-w-md mx-auto">
          Preparing your battle experience...
        </p>
      </div>
    </div>
  );
}

export default Loading;