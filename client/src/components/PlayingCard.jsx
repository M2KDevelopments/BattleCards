/* eslint-disable react/prop-types */
 
function PlayingCard({ 
    isDark , 
    color, 
    children, 
    sx , 
    onPlay, 
    title, 
    colorDemand, 
    isDisabled,
    isSelected  
}) {
    // 1. Determine the background color
    const defaultBg = isDark ? '#2c3e50' : (color || '#ecf0f1'); // Darker dark mode, light gray default
    
    // 2. Determine the border style
    const borderColor = colorDemand ? colorDemand : (isDark ? '#5a6a7a' : '#bdc3c7'); // Subtle default border
    const borderWidth = colorDemand ? '4px' : '1px';
    const borderStyle = `${borderWidth} solid ${borderColor}`;

    // 3. Construct base classes
    let classes = [
        "relative rounded-xl shadow-lg transition-all duration-300 p-4 flex items-center justify-center",
        "min-w-[70px] min-h-[100px] aspect-[7/10]", // Added size and aspect ratio for consistency
    ];
    
    // 4. Interaction (Hover/Click) classes
    if (onPlay && !isDisabled) {
        classes.push(
            "cursor-pointer", 
            "hover:shadow-xl", 
            "hover:scale-[1.05]", // Use scale instead of translate for smoother effect
            "active:scale-[0.98]", // Press down effect
        );
    } else {
        classes.push("cursor-default");
    }

    // 5. State-specific classes
    if (isDisabled) {
        classes.push("opacity-50 pointer-events-none"); // Visually disabled and unclickable
    }

    if (isSelected && !isDisabled) {
        // A clear visual indicator for selection
        classes.push("ring-4 ring-offset-2 ring-blue-500 shadow-2xl"); 
    }

    return (
        <div
            onClick={onPlay}
            title={title}
            role={onPlay ? "button" : "presentation"} // Accessibility role
            aria-disabled={isDisabled} // Accessibility state
            style={{
                background: defaultBg,
                border: borderStyle,
                ...sx,
            }}
            className={classes.join(' ')}
        >
            {children}
            {/* Added a subtle overlay for better text contrast/visual appeal in dark mode */}
            {isDark && <div className="absolute inset-0 rounded-xl opacity-10 bg-white pointer-events-none"></div>}
        </div>
    );
}

export default PlayingCard;