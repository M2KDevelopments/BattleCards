/* eslint-disable react/prop-types */
function PlayingCard({ isDark, color, children, sx }) {

    if (isDark) {
        return <div
            style={{ ...sx, borderColor: color || "rgb(51 65 85)", color: color || "rgb(51 65 85)" }}
            className="h-2/3 min-w-20 py-5 px-2 flex justify-center items-center rounded-md border-slate-700 border-2 text-sm cursor-pointer shadow-md hover:shadow-lg duration-200">
            {children}
        </div>
    }


    return <div
        style={{ ...sx, borderColor: color || "rgb(51 65 85)", color: color || "rgb(51 65 85)" }}
        className="h-2/3 min-w-20 py-5 px-2 flex justify-center items-center rounded-md border-slate-700 border-2 text-sm cursor-pointer shadow-md hover:shadow-lg duration-200">
        {children}
    </div>

}

export default PlayingCard