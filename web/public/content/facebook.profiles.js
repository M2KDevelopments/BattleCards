/* eslint-disable no-undef */
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Profiles")

const timeProfiles = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_profiles/)) {
        runProfilesPosts();
        clearInterval(timeProfiles);
    }
}, 1000);


async function runProfilesPosts() {

    const delay = (seconds = 4) => new Promise((resolve, reject) => setTimeout(resolve, seconds * 1000))
    const doc_id = '7456926777661832';
    const fbFriendlyName = 'ProfileCometTimelineFeedRefetchQuery';
    const profileID = getPageID();
    let cursor = null;

    // Map to collect people
    const posts = new Map();
    const limit = 30;
    let counter = 0;


    do {

        const variables = {
            "afterTime": null,
            "beforeTime": null,
            "count": 3,
            "cursor": cursor,
            "feedLocation": "TIMELINE",
            "feedbackSource": 0,
            "focusCommentID": null,
            "memorializedSplitTimeFilter": null,
            "omitPinnedPost": true,
            "postedBy": { "group": "OWNER" },
            "privacy": null,
            "privacySelectorRenderLocation": "COMET_STREAM",
            "renderLocation": "timeline",
            "scale": 1,
            "stream_count": 1,
            "taggedInOnly": null,
            "useDefaultActor": false,
            "id": profileID,
            "__relay_internal__pv__IsWorkUserrelayprovider": false,
            "__relay_internal__pv__IsMergQAPollsrelayprovider": false,
            "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false,
            "__relay_internal__pv__StoriesArmadilloReplyEnabledrelayprovider": true,
            "__relay_internal__pv__StoriesRingrelayprovider": false
        }


        const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, false);

        // if there are errors stop the loop
        if (json.errors) {
            console.log(json.errors);
            break;
        }


        // convert text response from api to json format 
        const list = JSON.parse(`[${json
            .replaceAll(`{"label":"ProfileComet`, `,{"label":"ProfileComet`)
            .replaceAll(`{"label":"CometFeed`, `,{"label":"CometFeed`)
            .replaceAll(`{"label":"VideoPlayer`, `,{"label":"VideoPlayer`)
            }]`);

        // variables to use for the next api graphql call
        let has_next_page = true;
        let next_cursor = null;
        let temp_cursor = null;

        for (const feed of list) {
            const { data } = feed;

            // Skip if it just showing summary of group feed
            if (data.page_info) {
                next_cursor = data.page_info.end_cursor;
                has_next_page = data.page_info.has_next_page;
                
                continue;
            }

            if (!data.node) continue;

            // update temporary cursor
            if (data.node.cursor) temp_cursor = data.node.cursor;

            if (data.node.timeline_list_feed_units && data.node.timeline_list_feed_units.edges) {
                for (const edge of data.node.timeline_list_feed_units.edges.filter(d => d.node.feeback)) {
                    const p = getPostInformation(edge, profileID, false, false);
                    posts.set(p.id, p);
                }
                console.log('🐕‍🦺🐕‍🦺 from Profile feed')
            } else {
                const post = getPostInformation(data, profileID, false, false);
                posts.set(post.id, post);
            }
        }


        // setup for next page
        await delay(5);
        counter += list.length;
        console.log('🐕‍🦺🐕‍🦺 Fetching', counter, 'out of', limit);
        if (!has_next_page) break;
        cursor = next_cursor ? next_cursor : temp_cursor;
    } while (posts.size < limit && counter < limit);

    console.log(posts);
}
