/*global chrome */
/**
 * create popup for facebook to show progress
 */
function createPopupUI() {
    const div = document.createElement('div');
    div.classList.add('crmsidekick-popup');
    div.innerHTML = `
        <img src="${chrome.runtime.getURL("/icons/fetching.gif")}" alt="CRM Side Kick"/>
        <div style="width: 100%;">
            <h5>CRM Side Kick</h5>
            <h6 title="Fetching results for you"></h6>
            <progress value="0" max="100"></progress>
        </div>
    `;
    document.body.appendChild(div);
}


/**
 * 
 * @param {Subtitle message to show on the popup} message 
 * @param {Progress percentage out of 100% to show on the display} progress 
 */
function updateProgress(message = "", progress = 0) {
    document.querySelector('.crmsidekick-popup h6').textContent = message;
    document.querySelector('.crmsidekick-popup progress').value = progress;
}