/* eslint-disable no-undef */
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Group")

const timeGroups = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_groups/)) {
        runGroupPosts();
        clearInterval(timeGroups);
    }else if (window.location.href.match(/#crmsidekick_grouphealth/)) {
        runGroupPosts();
        clearInterval(timeGroups);
    }
}, 1000);


async function runGroupPosts() {
    const delay = (seconds = 4) => new Promise((resolve, reject) => setTimeout(resolve, seconds * 1000))
    const doc_id = '6992195630879147';
    const fbFriendlyName = 'GroupsCometFeedRegularStoriesPaginationQuery';
    const groupID = getGroupID();
    let cursor = null;

    // Map to collect people
    const posts = new Map();
    const limit = 30;
    let counter = 0;



    do {

        const variables = {
            "count": 3,
            "cursor": cursor,
            "feedLocation": "GROUP",
            "feedType": "DISCUSSION",
            "feedbackSource": 0,
            "focusCommentID": null,
            "privacySelectorRenderLocation": "COMET_STREAM",
            "renderLocation": "group",
            "scale": 1,
            "sortingSetting": null,
            "stream_initial_count": 1,
            "useDefaultActor": false,
            "id": groupID,
            "__relay_internal__pv__IsWorkUserrelayprovider": false,
            "__relay_internal__pv__IsMergQAPollsrelayprovider": false,
            "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false,
            "__relay_internal__pv__StoriesArmadilloReplyEnabledrelayprovider": true,
            "__relay_internal__pv__StoriesRingrelayprovider": false
        };

        const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, false);

        // if there are errors stop the loop
        if (json.errors) {
            console.log(json.errors);
            break;
        }

        // convert text response from api to json format 
        const list = JSON.parse(`[${json
            .replaceAll(`{"label":"GroupsComet`, `,{"label":"GroupsComet`)
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

            if (data.node.group_feed && data.node.group_feed.edges) {
                for (const edge of data.node.group_feed.edges.filter(d => d.node.feeback)) {
                    const p = getPostInformation(edge, groupID, true, false);
                    posts.set(p.id, p);
                }
                console.log('🐕‍🦺🐕‍🦺 from Group feed')
            } else {
                const post = getPostInformation(data, groupID, true, false);
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


