/* eslint-disable no-undef */
//  https://www.facebook.com/friends/requests#crmsidekick_friendrequests
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Facebook Post")

const timePosts = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_posts/)) {
        runPosts();
        clearInterval(timePosts);
    }
}, 1000);


async function runPosts() {

    const doc_id = '7177188432369753';
    const fbFriendlyName = 'CometSinglePostContentQuery';
    const storyID = getStoryID();

    const variables = {
        "feedbackSource": 2,
        "feedLocation": "PERMALINK",
        "focusCommentID": null,
        "privacySelectorRenderLocation": "COMET_STREAM",
        "renderLocation": "permalink",
        "scale": 1,
        "storyID": storyID,
        "useDefaultActor": false,
        "__relay_internal__pv__IsWorkUserrelayprovider": false,
        "__relay_internal__pv__IsMergQAPollsrelayprovider": false,
        "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false,
        "__relay_internal__pv__StoriesArmadilloReplyEnabledrelayprovider": true,
        "__relay_internal__pv__StoriesRingrelayprovider": false
    };

    const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, true);
    const post = getPostInformation(json.data, 'post', false, true);

    console.log("🐕‍🦺🐕‍🦺 Fetched Friend Confirmations", post)

}

function getStoryID() {

    for (const s of document.querySelectorAll('script')) {
        if (s.textContent.indexOf("RelayPrefetchedStreamCache") !== -1) {

            const json = JSON.parse(s.textContent);
            const list = json.require[0][3][0].__bbox.require;

            const requireData = list.find(data => data[0] && data[0].match(/RelayPrefetchedStreamCache/gmi));
            if (requireData) {

                const data = requireData[3][1].__bbox.result.data;

                // public group
                if (data && data.node) return data.node.id;
            }
        }
    }
    return null;
} 