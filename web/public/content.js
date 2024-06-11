/* eslint-disable no-undef */

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    // New Model - https://dev.to/luckey/how-to-upgrade-text-davinci-003-to-gpt-35-turbo-2b6e#:~:text=Conclusion,to%20use%20the%20new%20model.
    if (message.cid === "alert") {
        Toastify({
            text: message.message,
            duration: 3000,
            destination: "https://crmsidekick.com",
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to right, #d17e00, #991c00)",
            },
            onClick: function () { } // Callback after click
        }).showToast();
    }

    sendResponse(true);
    return true;
});