/* eslint-disable no-undef */
// https://www.facebook.com/friends/requests#crmsidekick_friendrequests
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Facebook Friend Requests")

const timeFriendRequests = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_friendrequests/)) {
        runFriendRequests();
        clearInterval(timeFriendRequests);
    } else if (window.location.href.match(/#crmsidekick_friendconfirmations/)) {
        runFriendConfirmations();
        clearInterval(timeFriendRequests);
    }
}, 1000);


async function runFriendConfirmations() {

    const delay = (seconds = 4) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

    const doc_id = '4420916318007844';
    const fbFriendlyName = 'FriendingCometOutgoingRequestsDialogPaginationQuery';
    let cursor = null;
    let running = true;

    // Map to collect people
    const people = new Map();

    const limit = 300;

    while (running) {
        const variables = { "count": 10, "cursor": cursor, "scale": 1 };
        const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, true);

        // Add Details
        for (const edge of json.data.viewer.outgoing_friend_requests_connection.edges) {
            const { name, id, profile_picture, social_context } = edge.node;
            const image = profile_picture.uri;
            const social = social_context?.text
                .replace("Followed by ", "")
                .replace(" mutual friends", '')
                .replace(" mutual friend", '') || 0;

            // Get Mutual Friends and Followers
            const mutual = (social_context?.text || "").match(/mutual/gmi) ? parseInt(social) : 0;
            const followed = (social_context?.text || "").match(/followed/gmi) ? parseInt(social) : 0;

            // Add to map
            people.set(id, { id, name, image, mutual, followed })
        }

        // Delay processing
        await delay(4);
        console.log('🐕‍🦺🐕‍🦺', people.size, 'so far')

        const percentage = parseInt(people.size * 100.0 / limit);

        //from function/popup.js
        updateProgress(`🐕‍🦺🐕‍🦺 Fetching those friend confirmations (${percentage}%) Go boy!`, percentage);

        // get information about the next page
        cursor = json.data.viewer.outgoing_friend_requests_connection.page_info.end_cursor
        running = json.data.viewer.outgoing_friend_requests_connection.page_info.has_next_page
    }

    console.log("🐕‍🦺🐕‍🦺 Fetched Friend Confirmations", people.size)

    // save to chrome storage
    await chrome.storage.local.set({ friendconfirmations: Array.from(people.values()) });

    // send signal to background.js to display notification
    chrome.runtime.sendMessage({ cid: "notification", context: "Friend Confirmation Report", type: "friendconfirmations" });

    // open the report page
    setTimeout(()=>{
        window.location.href = chrome.runtime.getURL(`/index.html?fullscreen=true&reports_friendconfirmations`)
    }, 3000);


}


async function runFriendRequests() {

    const delay = (seconds = 4) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

    const doc_id = '4843321999100134';
    const fbFriendlyName = 'FriendingCometFriendRequestsSectionPanelPaginationQuery';
    let cursor = null;
    let running = true;

    // Map to collect people
    const people = new Map();

    let total = 0;

    // show UI from function/popup.js
    createPopupUI();

    while (running) {
        const variables = { "count": 20, "cursor": cursor, "scale": 1 };
        const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, true);

        // Get reported total
        total = json.data.viewer.friending_possibilities.count;


        // Add Details
        for (const edge of json.data.viewer.friending_possibilities.edges) {
            const { name, id, profile_picture, social_context, time } = edge.node;
            const image = profile_picture.uri;
            const date = time * 1000;
            const social = social_context?.text
                .replace("Followed by ", "")
                .replace(" mutual friends", '')
                .replace(" mutual friend", '') || 0;

            // Get Mutual Friends and Followers
            const mutual = (social_context?.text || "").match(/mutual/gmi) ? parseInt(social) : 0;
            const followed = (social_context?.text || "").match(/followed/gmi) ? parseInt(social) : 0;

            // Add to map
            people.set(id, { id, name, image, mutual, followed, date })
        }

        // Delay processing
        await delay(4);
        console.log('🐕‍🦺🐕‍🦺', people.size, 'out of', total)

        const percentage = parseInt(people.size * 100.0 / total);

        //from function/popup.js
        updateProgress(`🐕‍🦺🐕‍🦺 Fetching those friend requests (${percentage}%) Go boy!`, percentage);

        // get information about the next page
        cursor = json.data.viewer.friending_possibilities.page_info.end_cursor
        running = json.data.viewer.friending_possibilities.page_info.has_next_page
    }

    console.log("🐕‍🦺🐕‍🦺 Fetched Friend Requests", people.size)

    // save to chrome storage
    await chrome.storage.local.set({ friendrequests: Array.from(people.values()) });

    // send signal to background.js to display notification
    chrome.runtime.sendMessage({ cid: "notification", context: "Friend Requests Report", type: "friendrequests", goto: "reports_friendrequests" });

 
}
