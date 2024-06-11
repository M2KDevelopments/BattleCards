import React from 'react'
import Footer from './Footer'
import Navigation from './Navigation'

function AppBar({ children }) {
    return (
        <div>
            <Navigation />
            <div className='container-md'>{children}</div>
            <Footer />
        </div>
    )
}

export default AppBar