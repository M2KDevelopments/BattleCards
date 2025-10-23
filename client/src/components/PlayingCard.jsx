/* eslint-disable react/prop-types */
function PlayingCard({ isDark, color, children, sx, onPlay, title, colorDemand }) {

    return <div
        onClick={onPlay}
        title={title}
        style={{
            background: isDark ? '#1a1a2e' : color || '#fff',
            ...sx,
            border: colorDemand ? `4px solid ${colorDemand}` : '2px solid #333',
        }}
        className="relative rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 p-4 flex items-center justify-center min-w-[120px] h-[160px]"
    >
        {children}
    </div>

}

export default PlayingCard