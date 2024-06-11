/*global chrome*/
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import chromeStorageKeys from '../constants/chrome.storage.keys.json';

/**
 * This is being used in AppBar because bar loaded also every where except the login pages
 * @returns 
 */
function SaveLastRoute() {

    const location = useLocation();

    useEffect(() => {
        chrome.storage.local.set({ [chromeStorageKeys.lastpage]: location.pathname })
    }, [])

    return (
        <div></div>
    )
}

export default SaveLastRoute