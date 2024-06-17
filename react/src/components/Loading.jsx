/* eslint-disable react/prop-types */
function Loading({ countDown }) {
  return (
    <div>
      <img src="logo.svg" width={100} alt="Battle Cards" />
      <h1>Battle Cards Lobby</h1>
      <h1>Loading...{countDown}s</h1>
    </div>
  )
}

export default Loading