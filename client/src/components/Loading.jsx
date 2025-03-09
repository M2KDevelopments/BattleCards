import DarkOverlay from "./DarkOverlay"

/* eslint-disable react/prop-types */
function Loading({ area, countDown }) {
  return (
    <div className="w-screen">
      <DarkOverlay color="#00000077" />
      <div style={{ backgroundImage: `url(areas/${area}.jpeg)`, backgroundSize: '100%', overflow: 'hidden' }} className="h-screen text-white flex flex-col justify-center w-full items-center p-8">
        <img src="logo.png" width={200} alt="Battle Cards" className="relative z-10" />
        <h1 className="tablet:text-4xl laptop:text-7xl relative z-10">Battle Cards Lobby</h1>
        <h2 className="tablet:text-2xl laptop:text-5xl relative z-10">Loading...{countDown}s</h2>
      </div>
    </div>
  )
}

export default Loading