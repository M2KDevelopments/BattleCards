
import React from 'react';
import  { useLottie } from "lottie-react";
import * as lottieLoading from '../res/lottie_loading.json';
import * as lottieNotification from '../res/lottie_notification.json';
import * as lottieUpgrade from '../res/lottie_upgrade2.json';

function Lottie(props) {
  
const options = {
  animationData: props.lottie.default,
  loop: true,
  autoplay: true,
};
 
const { View } = useLottie(options);
  return View;
}

function Animation(props){
  return <div className="centralise" style={{width:props.width, height:props.height}}>
    <Lottie lottie={props.lottie} />
    <br/>
    <h4>{props.title}</h4>
  </div>
}

export const AnimationLoading = (props) => <Animation title={props.title} lottie={lottieLoading} width={props.width} />

export const AnimationNotifications = (props) => <Animation title={props.title} lottie={lottieNotification} width={props.width} />

export const AnimationUpgrade = (props) => <Animation title={props.title} lottie={lottieUpgrade} width={props.width} />



