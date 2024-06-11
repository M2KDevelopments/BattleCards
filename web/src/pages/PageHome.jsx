import React, { useContext, useEffect, useRef, useState } from 'react';
import AppBar from '../components/AppBar';
import ViewFacebook from '../views/ViewFacebook';
import ViewYoutube from '../views/ViewYoutube';
import ViewLinkedin from '../views/ViewLinkedin';
import ViewInstagram from '../views/ViewInstagram';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { BsGear } from 'react-icons/bs';
import ViewSettings from '../views/ViewSettings';
import { ContextFullScreen } from '../App';
import { useNavigate } from 'react-router-dom';
import PageReport from './PageReport';


const FACEBOOK = 1, YOUTUBE = 2, LINKEDIN = 3, INSTAGRAM = 4, SETTINGS = -1;

function PageHome() {

  const [platform, setPlatform] = useState(FACEBOOK)
  const containerRef = useRef();
  const fullscreen = useContext(ContextFullScreen);

  const onPlatformSelect = (p) => {
    setPlatform(p)
    if (containerRef.current) containerRef.current.scrollTo(0, 0);
  }


  // if url contains report signature just display reports page
  if (window.location.href.includes('reports_')) return <PageReport />


  return (
    <AppBar>
      <section className='flex gap-6 justify-center mb-2 py-2 bg-[#1e2126] rounded-full'>
        <div title="Facebook" onClick={() => onPlatformSelect(FACEBOOK)} style={{ borderColor: platform === FACEBOOK ? "#198cf5" : "ghostwhite" }} className='rounded-full p-3 border-2 cursor-pointer hover:bg-slate-500 duration-200'>
          <FaFacebook size={20} color={platform === FACEBOOK ? "#198cf5" : "ghostwhite"} />
        </div>
        <div title="Instagram" onClick={() => onPlatformSelect(INSTAGRAM)} style={{ borderColor: platform === INSTAGRAM ? "#db0490" : "ghostwhite" }} className='rounded-full p-3 border-2 cursor-pointer hover:bg-slate-500 duration-200'>
          <FaInstagram size={20} color={platform === INSTAGRAM ? "#db0490" : "ghostwhite"} />
        </div>
        <div title="Youtube" onClick={() => onPlatformSelect(YOUTUBE)} style={{ borderColor: platform === YOUTUBE ? "#d20707" : "ghostwhite" }} className='rounded-full p-3 border-2 cursor-pointer hover:bg-slate-500 duration-200'>
          <FaYoutube size={20} color={platform === YOUTUBE ? "#d20707" : "ghostwhite"} />
        </div>
        <div title="Linkedin" onClick={() => onPlatformSelect(LINKEDIN)} style={{ borderColor: platform === LINKEDIN ? "#028cf1" : "ghostwhite" }} className='rounded-full p-3 border-2 cursor-pointer hover:bg-slate-500 duration-200'>
          <FaLinkedin size={20} color={platform === LINKEDIN ? "#028cf1" : "ghostwhite"} />
        </div>
        <div title="Help and Settings" onClick={() => onPlatformSelect(SETTINGS)} style={{ borderColor: platform === SETTINGS ? "#f1be02" : "ghostwhite" }} className='rounded-full p-3 border-2 cursor-pointer hover:bg-slate-500 duration-200'>
          <BsGear size={20} color={platform === SETTINGS ? "#f1be02" : "ghostwhite"} />
        </div>
      </section>
      <div style={{ overflowY: "scroll", height: fullscreen ? window.document.documentElement.clientHeight - 115 : 440 }} ref={containerRef}>
        {platform === FACEBOOK && <ViewFacebook />}
        {platform === YOUTUBE && <ViewYoutube />}
        {platform === LINKEDIN && <ViewLinkedin />}
        {platform === INSTAGRAM && <ViewInstagram />}
        {platform === SETTINGS && <ViewSettings />}
      </div>
    </AppBar >
  )
}

export default PageHome