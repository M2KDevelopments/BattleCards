/* eslint-disable react/prop-types */
function Loading({ countDown }) {
  return (
    <div className="flex flex-col w-full items-center p-8 border-2 border-purple-500 border-solid shadow-xl shadow-purple-300">
      <img src="logo.png" width={100} alt="Battle Cards" />
      <h1>Battle Cards Lobby</h1>
      <h2 className="text-2xl">Loading...{countDown}s</h2>
    </div>
  )
}

export default Loading