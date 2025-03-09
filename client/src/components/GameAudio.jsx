
function GameAudio() {
    
    return (
        <>
            <audio id="main-audio" className='fixed invisible' src="music/menu.mp3" autoPlay={true} loop={true}></audio>
            <audio id="gameover-audio" className="fixed invisible" src="music/gameover.mp3"></audio>
        </>
    )
}

export default GameAudio