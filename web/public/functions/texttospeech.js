// Documentation: https://developer.chrome.com/docs/extensions/reference/tts/#generating-speech
/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/*global chrome*/

/**
 * Use the default Google Chrome TTS feature to play text
 * @param {text} Text the text to be spoken 
 */
function speak(text) {
    chrome.runtime.sendMessage({cid:"tts", message:text})
}

 