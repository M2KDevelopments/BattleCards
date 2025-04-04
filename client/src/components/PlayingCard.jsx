/* eslint-disable react/prop-types */
function PlayingCard({ isDark, color, children, sx, onPlay, title, colorDemand }) {

    if (isDark) {
        return <div
            title={title}
            onClick={onPlay}
            role="button"
            style={{ ...sx, borderColor: color || "rgb(51 65 85)", color: color || "rgb(51 65 85)" }}
            className="relative h-2/3 min-w-20 py-5 px-2 flex justify-center items-center rounded-md border-slate-700 bg-slate-900 border-5 text-lg cursor-pointer shadow-md hover:shadow-xl duration-200">
            {children}
            {colorDemand ? <span style={{ background: colorDemand }} className="w-8 h-8 -top-5 -right-5 absolute shadow-xl p-2 rounded-full"></span> : null}
        </div>
    }


    return <div
        title={title}
        onClick={onPlay}
        role="button"
        style={{ ...sx, borderColor: color || "rgb(51 65 85)", color: color || "rgb(51 65 85)" }}
        className="relative h-2/3 min-w-20 py-5 px-2 flex justify-center items-center rounded-md border-slate-700 bg-slate-100 border-5 text-lg cursor-pointer shadow-md hover:shadow-xl duration-200">
        {children}
        {colorDemand ? <span style={{ background: colorDemand }} className="w-8 h-8 -top-5 -right-5 absolute shadow-xl p-2 rounded-full"></span> : null}
    </div>

}

export default PlayingCard