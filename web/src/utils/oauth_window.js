/* eslint-disable no-undef */

export function openOAuthWindow(url, platform) {

    return new Promise(resolve => {

        // content script (./auth.js) of this extension will read the access token from the DOM and send a message back
        chrome?.windows?.create({ url: url, focused: true, width: 600, height: 480, type: "panel" }, function (win) {

            const removeListneer = (win) => {
                chrome?.windows?.onRemoved?.removeListener(removeListneer);
                resolve({ result: false, message: "Failed to Log in with " + platform });
            }

            chrome?.windows?.onRemoved?.addListener(removeListneer);

            const listener = async (request, sender, sendResponse) => {


                if (request.cid === 'oauth') {
                    //save user
                    const { access_token } = request;
                    chrome.storage.local.set({ user: access_token })
                    chrome.runtime.onMessage.removeListener(listener);
                    chrome.windows.remove(win.id);
                    chrome.windows.onRemoved.removeListener(removeListneer);
                    console.log('User Oauth Login Succesfully');
                    resolve({ result: true, message: `Log in successful` });
                }
            }

            // listening for message coming from contents scripts
            chrome?.runtime?.onMessage?.addListener(listener);
        });
    })
}