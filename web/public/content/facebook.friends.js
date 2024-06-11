/* eslint-disable no-undef */
//https://www.facebook.com/profile.php?sk=friends#crmsidekick_friends
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Facebook Friends")

const timeFriends = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_friends/)) {
        runFriends();
        clearInterval(timeFriends);
    } else if (window.location.href.match(/#crmsidekick_mutual_friends/)) {
        runFriends("Mutual Friends");
        clearInterval(timeFriends);
    } else if (window.location.href.match(/#crmsidekick_followers/)) {
        runFriends("Followers");
        clearInterval(timeFriends);
    }
}, 1000);


async function runFriends(category = "Friends") {

    const delay = (seconds = 4) => new Promise(resolve => setTimeout(resolve, seconds * 1000))

    const doc_id = '7750079245029897';
    const fbFriendlyName = 'ProfileCometAppCollectionListRendererPaginationQuery';
    let { cursor, count, id, people: list } = getUserFriendData(category);



    // let cursor = null;
    let running = true;
    let counter = 0;
    const limit = count || 300;


    // Map to collect people
    const people = new Map();

    // show UI from function/popup.js
    createPopupUI();


    // check if credientials where gathered
    if (!cursor && !count && !id) return updateProgress('Could not fetch friends', 0);



    //first people that show up in the UI
    for (const edge of list) {
        const image = edge.node.image.uri;
        const bio = edge.node.subtitle_text.text;
        const { gender, id, name, friendship_status } = edge.node.actions_renderer.action.client_handler.profile_action.restrictable_profile_owner

        // add person
        people.set(id, { id, name, image, bio, gender, friendship_status });
    }
    console.log("🐕‍🦺🐕‍🦺 Fetched first", people.size, 'people');


    while (running && counter < limit) {
        const variables = {
            "count": 8,
            "cursor": cursor,
            "scale": 1,
            "search": null,
            "id": id
        }
        const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, true);

        // Update edges
        for (const edge of json.data.node.pageItems.edges) {
            const image = edge.node.image.uri;
            const bio = edge.node?.subtitle_text?.text || "";
            const { gender, id, name, friendship_status } = edge.node.actions_renderer.action.client_handler.profile_action.restrictable_profile_owner

            // add person
            people.set(id, { id, name, image, bio, gender, friendship_status });
        }


        // delay processing
        await delay(5);


        // Update info for next page
        id = json.data.node.id;
        cursor = json.data.node.pageItems.page_info.end_cursor;
        running = json.data.node.pageItems.page_info.has_next_page;
        counter += json.data.node.pageItems.edges.length;
        console.log("🐕‍🦺🐕‍🦺 Fetched", people.size, 'out of', limit);


        const percentage = parseInt(people.size * 100.0 / limit);

        //from function/popup.js
        updateProgress(`🐕‍🦺🐕‍🦺 Fetching those friend confirmations (${percentage}%) Go boy!`, percentage);

    }

    console.log("🐕‍🦺🐕‍🦺 Fetched Friends", people.size)

    // save to chrome storage
    await chrome.storage.local.set({ friends: Array.from(people.values()) });

    // send signal to background.js to display notification
    chrome.runtime.sendMessage({ cid: "notification", context: "Friends' Report", type: "friends", goto: "reports_friends" });     

}

/**
 * Checks the DOM for the user api data for friends
 * @returns User api data for friends that exists on the DOM
 */
function getUserFriendData(category = "Friends") {

    for (const s of document.querySelectorAll('script')) {
        if (s.textContent.indexOf("RelayPrefetchedStreamCache") !== -1) {
            const json = JSON.parse(s.textContent);
            const list = json.require[0][3][0].__bbox.require;
            const requireData = list.find(data => data[0] && data[0].match(/RelayPrefetchedStreamCache/gmi));
            if (requireData) {
                const data = requireData[3][1].__bbox.result.data;

                // Get friend list information
                if (data && data.node && data.node.all_collections) {
                    for (const col of data.node.all_collections.nodes) {
                        const { id, items, pageItems, name } = col.style_renderer.collection;
                        if (name === category) return { id, count: items.count, people: pageItems.edges, cursor: pageItems.page_info.end_cursor }
                        else if (category === "Friends" && name === "All friends") return { id, count: items.count, people: pageItems.edges, cursor: pageItems.page_info.end_cursor }
                    }
                }
            }
        }
    }

    return { id: null, count: 0, people: [], cursor: null };
}

