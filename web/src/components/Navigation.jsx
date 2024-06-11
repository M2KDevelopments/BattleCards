/*global chrome*/
import React, { useContext } from 'react'
import { FaCircle } from 'react-icons/fa';
import swal from 'sweetalert';
import { ContextFullScreen } from '../App';
import * as API from '../utils/api'
import { useNavigate } from 'react-router-dom';

function Navigation() {

    const fullscreen = useContext(ContextFullScreen)
    const navigate = useNavigate();

    const onMinimize = () => {
        window.close();
    }

    const onMaximize = () => {
        if (fullscreen) return;
        const url = chrome.runtime.getURL('/index.html?fullscreen=true');
        chrome.tabs.create({ url });
    }

    const onClose = async () => {
        const result = await swal({
            title: 'Logout?',
            text: 'Are you sure you want to log out?',
            icon: "info",
            buttons: ['No', 'Yes']
        });

        if (!result) return;
        await API.logout();
        navigate('/')
    }


    return (
        <div className='flex justify-end px-4 py-2'>
            <div title="Minimize Extension" onClick={onMinimize} className='px-1 cursor-pointer'><FaCircle size={16} color="gold" /></div>
            <div title="Maximize Extension" onClick={onMaximize} className='px-1 cursor-pointer'><FaCircle size={16} color="#1bba08" /></div>
            <div title="Logout" onClick={onClose} className='px-1 cursor-pointer'><FaCircle size={16} color="red" /></div>
        </div>
    )
}

export default Navigation