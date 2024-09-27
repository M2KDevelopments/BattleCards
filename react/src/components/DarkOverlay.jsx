/* eslint-disable react/prop-types */
import { useEffect } from "react";

function DarkOverlay({ color }) {

    useEffect(() => {
        document.body.style.backgroundColor = '#000000';
        document.body.style.backgroundImage = `url('/battlecards.png')`;
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundSize = '100%';
        document.body.style.background
        document.body.style.overflow = 'hidden';
    }, [])

    return (
        <div style={{ background: color || "#0000007a" }} className="pointer-events-none w-screen h-screen fixed top-0 left-0 z-0"></div>
    )
}

export default DarkOverlay