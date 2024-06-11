import React, { useState, useEffect } from "react"
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";

// pages
import PageHome from "./pages/PageHome";
import PageLogin from "./pages/PageLogin";

// others
// import * as API from "./utils/api";
export const ContextFullScreen = React.createContext(false);
function App() {
 
  const [fullscreen, setFullscreen] = useState(false);

  // check for fullscreen
  useEffect(() => {
    const fullscreen = window.location.href.includes("fullscreen");
    setFullscreen(fullscreen);
    if (fullscreen) document.body.classList.add("fullscreen");
  }, [])

  return (
    <div className="main">
      <ContextFullScreen.Provider value={fullscreen}>
        <Router>
          <Routes>
            <Route path="/" element={<PageLogin />} />
            <Route path="/app" element={<PageHome />} />
          </Routes>

        </Router>
      </ContextFullScreen.Provider>
    </div>

  );
}

export default App;
