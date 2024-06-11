/* eslint-disable no-undef */
// https://www.facebook.com/groups/feed#crmsidekick_groups
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Facebook Group Feed")

const timeGroupRequests = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_groups/)) {

        // show UI from function/popup.js
        createPopupUI();

        // get groups
        getGroups(false).then(async groups => {
            const myGroups = await getGroups(true);
            await chrome.storage.local.set({
                facebookGroups: [...groups, myGroups].sort((a, b) => a.name.localeCompare(b.name))
            });

            Toastify({
                text: "Done fetch your groups. You can view them in your extension",
                duration: 7000,
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
        });

        // clear interval
        clearInterval(timeGroupRequests);
    }
}, 1000);


/**
 * 
 * @param {If the groups to collect should be owner by me} mine 
 * @returns Array of groups
 */
async function getGroups(mine = true) {


    const delay = (seconds = 4) => new Promise((resolve, reject) => setTimeout(resolve, seconds * 1000))
    const doc_id = '9822178014474235';
    const fbFriendlyName = 'GroupsLeftRailYourGroupsPaginatedQuery';
    let cursor = null;

    // Map to collect people
    const groups = new Map();
    const limit = 300;
    let counter = 0;

    do {

        const variables = {
            "count": 10,
            "cursor": cursor,
            "scale": 1
        };
        if (!mine) variables["listType"] = "NON_ADMIN_MODERATOR_GROUPS";

        const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, true);

        // if there are errors stop the loop
        if (json.errors) {
            console.log(json.errors);
            break;
        }

        // update the groups
        for (const data of json.data.viewer.groups_tab.tab_groups_list.edges) {
            const { id, last_post_time, name, url } = data.node;
            const image = data.node.profile_picture_48.uri;
            groups.set(id, { id, name, last_post_time, url, image, mine });
        }

        // setup for next page
        await delay(5);
        counter += json.data.viewer.groups_tab.tab_groups_list.edges.length;
        console.log('🐕‍🦺🐕‍🦺 Fetching', counter, 'out of', limit);
        const percentage = parseInt(counter * 100.0 / limit);

        //from function/popup.js
        updateProgress(`🐕‍🦺🐕‍🦺 Fetching Groups ${percentage}%! Go boy!`, percentage)

        // update cursor
        const { end_cursor, has_next_page } = json.data.viewer.groups_tab.tab_groups_list.page_info;
        cursor = end_cursor;

        // stop the loop
        if (!has_next_page) break;
    } while (groups.size < limit && counter < limit);

    // update to group extension
    return Array.from(groups.values());
}