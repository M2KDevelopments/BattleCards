/* eslint-disable no-undef */
// CRM Side Kick Messaging Myself
// https://www.facebook.com/messages#crmsidekick_msgtemplate
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Facebook Messenger")

// from functions/facebook.api.call.js
const facebookId = getMyFacebookID();

if (window.location.href.includes("#crmsidekick_msgtemplate")) {
    if (!window.location.href.includes(facebookId)) window.location.href = `https://facebook.com/messages/t/${facebookId}#crmsidekick_msgtemplate`
    else {
        const t = setInterval(() => {
            if (document.querySelector('[contenteditable="true"]')) {
                runMessengerTest();
                clearInterval(t);
            }
        }, 100)
    }

}

async function delayMessenger(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000))
}

async function getSendButton() {
    // look for send button
    let trials = 1000;
    let button = document.querySelector('div[aria-label="Press enter to send"]')

    do {
        await delayMessenger(0.5);
        trials--
        console.log('Looking for button')
        button = document.querySelector('div[aria-label="Press enter to send"]')
        if (!button) button = document.querySelector('div[aria-label="Press Enter to send"]')
        if (!button) button = document.querySelector('div[aria-label="Press Enter to Send"]')
        if (!button) button = document.querySelector('div[aria-label="press enter to send"]')
        if (!button) {
            const btns = document.querySelectorAll('div[aria-label]');
            for (const btn of btns) {
                const arialabel = btn.getAttribute('aria-label')
                if (arialabel && arialabel.toLowerCase().includes('send'.toLowerCase())) {
                    button = btn;
                    break;
                }
            }
        }

    } while (trials > 0 && !button)

    return button;
}

async function runMessengerTest() {
    const { settings } = await chrome.storage.local.get('settings');
    const { reportMessage } = settings;
    const sampleMessage = ` 🐕 Automation complete! Done analysing your data at ${(new Date()).toDateString()}, you can find the results here https://crmsidekick.com`
    const contenteditable = document.querySelector('[contenteditable="true"]');
    try {
        contenteditable.focus()
        document.execCommand('insertText', false, `${reportMessage}${sampleMessage}`);
        await delayMessenger(2) // seconds
        const button = await getSendButton();
        if (button) button.click();
    } catch (e) {
        console.log(e);
    } finally {
        await delayMessenger(2) // seconds
        window.close();
    }
}