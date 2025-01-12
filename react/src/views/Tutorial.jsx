import DarkOverlay from "../components/DarkOverlay";
import { ContextData, PAGE_MENU, } from "../App";
import { useContext } from "react";


function Tutorial() {
    const { setPage } = useContext(ContextData);
    return (
        <div style={{ backgroundImage: `url('/battlecards.jpg')`, backgroundSize: '100%', overflow: 'hidden' }} className="h-screen flex flex-col gap-4 justify-center items-center align-middle m-auto">
            <DarkOverlay />
            <button className='z-10 text-3xl rounded-md px-8 py-2 border-2 border-purple-300 bg-pink-700 hover:bg-pink-900 duration-200 text-white' onClick={() => setPage(PAGE_MENU)}>Back To Main Menu</button>

        </div>
    )
}

export default Tutorial