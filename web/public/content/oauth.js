/*global chrome*/
/** This looks for the OAUTH Screen for to get the access token from the url */
console.log('CRM Side Kick');
if (window.location.href.match(/crmsidekick.*oauth/gmi)) {
    const access_token = document.querySelector(".access_token").textContent;
    chrome.runtime.sendMessage({ cid: "oauth", access_token });
}