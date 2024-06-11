
/**
 * Look in the network section of the console window on facebook it you will see the graphql api call. This function simulates the graphql api call on facebook.
 * @param {*} fbFriendlyName 
 * @param {*} variables 
 * @param {*} doc_id 
 * @param {*} isJson if the GraphQL API returns a json or not.
 * @returns 
 */
async function facebookGraphQL(fbFriendlyName, variables, doc_id, isJson = true) {
    try {

        const subdomain = window.location.href.indexOf("https://web") !== -1 ? "web" : "www";

        // Get User info
        const script = document.getElementById('__eqmc');
        const user = JSON.parse(script.textContent)
        const hsi = user['e'];
        const fb_dtsg = user['f'];
        const u = user['u'];//querystring
        const userinfo = queryStringToJSON(u);
        const jazoest = userinfo.jazoest
        const fbid = userinfo.__user
        const comet_req = userinfo.__comet_req;

        const data = {
            "av": fbid,
            "__user": fbid,
            "__a": "1",
            "__req": "q",
            "__hs": "19610.HYP:comet_pkg.2.1..2.1",
            "dpr": "1.5",
            "__ccg": "MODERATE",
            "__rev": "1008548502",
            "__s": "trgxfi:xcj9hz:w41wus",
            "__hsi": hsi,
            "__dyn": "7AzHK4HzEmwIxt0mUyEqxenFwLBwopU98nwgUao4u5QdwSxucyUco5S3O2Saw8i2S1DwUx60DUG0Z82_CxS320om78bbwto88422y11xmfz83WwgEcEhwGxu782lwv89kbxS2218wc61awkovwRwlE-U2exi4UaEW2au1jxS6FobrwKxm5oe8cEW4-5pUfEe88o4Wm7-8wywdG7FoarCwLyESE6C14wwwOg2cwMwhEkxe3u364UrwFg662S269wkopg6C13whEeE",
            "__csr": "ghl1V9bf6gztn5YBh6ItsYT97OjMBsJhALZ_OOhAizlltrJpWAEQNfCRrtna-8Bz_aAHVtfGQSr8VbVAeQc9GtoKaperACmqEKEPKibjAiKiQBCBAxamu8G8CK8J1GlQuSmmrGi8gpGq48WXCLVEmWgOeGjUx12iUFbyHK68CdG6FaG9zoG8z8y7UWq2GfzqzopG4F8gm5EGezoiypfAwWy8izqG4oaVoDDwJCG2i4UC4o8Q8xF1ha58qwZK5GXxO5EowDzES8wBwDxu4o4OcXwHwhUcUyu2i9G5oCE4e362-5UO585C12w2VHw0qxo1tU02N4w6jAw3wo0xy08gIB09q0ue7U1XA79819EG0DEtw0AAg0omw11a9Lg3XBw9G0dyx6awuE0U64cQK1wVA18g3Pw1UaS0k20UO5yEC08Jwt83eCw2p816XG0D8W1cw9m0ma0oO4A0Zo3gw1kq",
            "__comet_req": comet_req,
            "fb_dtsg": fb_dtsg,
            "jazoest": jazoest,
            "lsd": "7Z0opWmQkwk2lETJxyo0AZ",
            "__spin_r": "1008548502",
            "__spin_b": "trunk",
            "__spin_t": "1694339702",
            "fb_api_caller_class": "RelayModern",
            "fb_api_req_friendly_name": fbFriendlyName,
            "variables": JSON.stringify(variables),
            "server_timestamps": "true",
            "doc_id": doc_id
        }


        // Create Formdata
        const formdata = new FormData();
        for (let key in data) formdata.append(key, data[key]);

        // Create URL Params for API
        const body = new URLSearchParams(formdata);


        const res = await fetch(`https://${subdomain}.facebook.com/api/graphql/`, {
            "headers": {
                "Accept": "*/*",
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
                "Content-type": "application/x-www-form-urlencoded",
                "x-fb-friendly-name": fbFriendlyName,
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": body,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        if (isJson) return await res.json();
        else return await res.text();

    } catch (e) {
        console.log(e.message);
        return null
    }
}

/**
 * Get the logged in profile's facebook ID
 * @returns Get the logged in profile's facebook ID
 */
function getMyFacebookID() {
    // Get User info
    const script = document.getElementById('__eqmc');
    const user = JSON.parse(script.textContent)
    const u = user['u'];//querystring
    const userinfo = queryStringToJSON(u);
    const fbid = userinfo.__user
    return fbid;
}

/**
 * Checks the DOM for the facebook group numeric id
 * @returns Facebook Group numeric id that exists on the DOM
 */
function getGroupID() {
    for (const s of document.querySelectorAll('script')) {
        if (s.textContent.indexOf("RelayPrefetchedStreamCache") !== -1) {

            const json = JSON.parse(s.textContent);
            const list = json.require[0][3][0].__bbox.require;

            const requireData = list.find(data => data[0] && data[0].match(/RelayPrefetchedStreamCache/gmi));
            if (requireData) {

                const data = requireData[3][1].__bbox.result.data;

                // public group
                if (data && data.viewer && data.viewer.comet_classic_identity) return data.viewer.comet_classic_identity.id;

                // private group
                if (data && data.group && data.group) return data.group.id;
            }
        }
    }
    return null;
}

/**
 * Checks the DOM for the facebook page numeric id
 * @returns Facebook Page numeric id that exists on the DOM
 */
function getPageID() {
    for (const s of document.querySelectorAll('script')) {
        if (s.textContent.indexOf("RelayPrefetchedStreamCache") !== -1) {

            const json = JSON.parse(s.textContent);
            const list = json.require[0][3][0].__bbox.require;

            const requireData = list.find(data => data[0] && data[0].match(/RelayPrefetchedStreamCache/gmi));
            if (requireData) {

                const data = requireData[3][1].__bbox.result.data;

                // page id
                if (data && data.user) return data.user.id;

            }
        }
    }
    return null;
}

/** Generate Post information */
function getPostInformation(data, id, group, page) {


    //get post data
    const { post_id } = data.node;
    const feedback_id = data.node.feedback.id;
    const { actors, message, wwwURL, attachments } = data.node.comet_sections.content.story;


    // get all sub attachments from post
    const subattachments = [];
    data.node.comet_sections.content.story.attachments.forEach(a => {
        if (a.styles.attachment.all_subattachments) subattachments.push(...a.styles.attachment.all_subattachments.nodes);
    })


    // List of photos of those who contribute to creating the post.
    const actorphotos = data.node.comet_sections.context_layout.story.comet_sections.actor_photo.story.actors

    // Get comment count
    const commentCount = data?.node?.comet_sections?.feedback?.story?.feedback_context?.feedback_target_with_context?.ufi_renderer?.feedback?.total_comment_count ||
        data.node.comet_sections.feedback.story.feedback_context.feedback_target_with_context.ufi_renderer.feedback.comet_ufi_summary_and_actions_renderer.feedback.total_comment_count;
    const reactionCount = data.node.comet_sections.feedback.story.feedback_context.feedback_target_with_context.ufi_renderer.feedback.comet_ufi_summary_and_actions_renderer.feedback.reaction_count.count
    const shareCount = data.node.comet_sections.feedback.story.feedback_context.feedback_target_with_context.ufi_renderer.feedback.comet_ufi_summary_and_actions_renderer.feedback.share_count.count

    // Get post date and title
    let date = Date.now();
    let title = document.title;
    for (const meta of data.node.comet_sections.context_layout.story.comet_sections.metadata) {
        if (meta.story.creation_time) date = meta.story.creation_time * 1000;
        if (meta.story.privacy_scope) title = meta.story.privacy_scope.description;
    }

    // Create schema for post
    const post = {
        id: post_id,

        groupName: title,
        feedback: feedback_id,
        text: message.text,
        url: wwwURL,
        date: date,
        comments: [],
        reactions: { total: reactionCount, shares: shareCount, like: 0, love: 0, wow: 0, heart: 0, haha: 0, angry: 0, sad: 0, comments: commentCount },
        // lists
        attachments: !attachments ? [] : attachments
            .map(a => {
                // if its a link
                if (a.comet_footer_renderer.attachment.target && a.comet_footer_renderer.attachment.target.__typename === "ExternalUrl") {
                    return {
                        type: "link",
                        title: a.comet_footer_renderer.attachment.title_with_entities.text,
                        url: a.comet_footer_renderer.attachment.target.external_url,
                        description: a.comet_footer_renderer.attachment.description
                    }
                } else if (a.__typename === "StoryAttachment") {
                    if (a.styles.attachment.media) {
                        const { photo_image, url } = a.styles.attachment.media;
                        return {
                            url,
                            image: photo_image.uri,
                            type: "image"
                        }
                    } else return { type: "none" }
                } else return { type: "none" }
            }),
        actors: actors.map(a => {
            return {
                name: a.name,
                id: a.id,
                image: !actorphotos ? undefined : actorphotos.find(ac => ac.id === a.id)?.profile_picture?.uri || undefined
            }
        }),
    }

    // Update subattachments photos
    for (const sub of subattachments) {
        const { media } = sub;
        if (media && media.__typename === "Photo") post.attachments.push({ image: media.image.uri, type: "image" })
    }

    if (group) post.groupID = id;
    else if (page) post.pageID = id;
    else post.profileID = id;

    return post;
}

/**
 * 
 * @param {List of facebook ids to send friend requests to} friend_requestee_ids 
 * @returns API result from friend requesting
 */
async function sendFriendRequest(friend_requestee_ids) {

    try {
        const bson = JSON.parse(document.querySelector('#__eqmc').textContent);
        const hsi = bson.e;
        const fb_dtsg = bson.f;
        const list = bson.u.split("&");
        const fb_id = list[1].replace("__user=", "");
        const comet_req = list[2].replace("__comet_req=", "");
        const jazoest = list[3].replace("jazoest=", "");


        const headers = {
            Accept: 'application/json, application/xml, text/plain, text/html, *.*',
            'Content-Type': 'application/x-www-form-urlencoded',//'text/javascript; charset=utf-8',//"multipart/form-data" //'application/json; charset=utf-8',
            "accept": "*/*",
            "content-type": "application/x-www-form-urlencoded",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-fb-friendly-name": 'FriendingCometFriendRequestSendMutation',
        };


        const formdata = new FormData();
        formdata.append('av', fb_id); //changable
        formdata.append('__user', fb_id); //changable
        formdata.append('__a', '1');
        formdata.append('__dyn', '7AzHJ16U9ob8ng5K8G6EjBWo2nDwAxu13w8CewSwMwNw9G2Saxa1NwJwpUe8hwaG0Z82_CxS320om78c87m221FwgolzUO0n2US2G5Usw9m1YwBgK7o884y0Mo4G4Ufo5m1mzXxG1Pxi4UaEW2G1jxS6FobrwKxm5o7G4-5pUfE98jwxwjFovUaU3VBwJCwLyES0Io88cA0z8c84qifxe3u362-2B0'); //changable
        formdata.append('__csr', 'gjiPNcbinvdvfEBY-gAOOsh5NshTPlt_bkkOPfiXYB99BPjuQDAlqGJdbAGHLWilJKHKGGl2FeUNep7ACiF4mcGnBCgrBZ5XAzVuqENeqq2SuaxqV9AUG2KGxeHzAu8ho88hxe5U98_AgKEcE-ubyrBwxxS5EaEzKdwNACwbOu2m0OawiUnwaC2O16w8Ku2a2G2-2u18wc20xA9wgE56265U07BW00xY85216wca0aMw0xIw0DKxW0g6m4Aew0_no0hSw0Few4Zw'); //changable
        formdata.append('__req', 's'); //changable
        formdata.append('__hs', '19242.HYP:comet_pkg.2.1.0.2.1');
        formdata.append('dpr', '1');
        formdata.append('__ccg', 'GOOD');
        formdata.append('__rev', '1006154635');
        formdata.append('__s', 'at3sfb:v1k4oa:upwmew'); //changable
        formdata.append('__hsi', hsi); //changable
        formdata.append('__comet_req', comet_req); //changable
        formdata.append('fb_dtsg', fb_dtsg); //changable
        formdata.append('jazoest', jazoest);
        formdata.append('lsd', 'az_0Egr_g1pKwzvxoHVQFZ');
        formdata.append('__spin_r', '1006154635');
        formdata.append('__spin_b', 'trunk');
        formdata.append('__spin_t', '1662536324');
        formdata.append('fb_api_caller_class', 'RelayModern');
        formdata.append('fb_api_req_friendly_name', 'FriendingCometFriendRequestSendMutation');//changable
        formdata.append('server_timestamps', true);

        formdata.append('variables', JSON.stringify({
            "input": {
                "attribution_id_v2": "FriendingCometRoot.react,comet.friending,via_cold_start,1710416514323,771661,2356318349,,",//"CometSinglePostRoot.react,comet.post.single,via_cold_start,1668512314218,992827,,",
                "friend_requestee_ids": friend_requestee_ids,
                "people_you_may_know_location": "friends_center",
                "refs": [null],
                "source": "people_you_may_know",// "profile_browser",
                "warn_ack_for_ids": [],
                "actor_id": fb_id,
                "client_mutation_id": "2",//"1"
            },
            "scale": 1
        })); //changable

        formdata.append('doc_id', '25018382824444451'); //changable

        const body = new URLSearchParams(formdata);
        const web = window.location.href.match(/^https:\/\/web/gmi) ? true : false;
        const api = web ? 'https://web.facebook.com/api/graphql/' : 'https://www.facebook.com/api/graphql/'
        const res = await fetch(api, { method: "POST", body: body, headers: headers, "mode": "cors", "credentials": "include", "referrer": window.location.href })
        const json = await res.json();
        return json;


    } catch (e) {
        console.log(e);
    }
}

// https://stackoverflow.com/questions/11557526/deserialize-query-string-to-json-object
function queryStringToJSON(qs) {

    var pairs = qs.split('&');
    var result = {};
    pairs.forEach(function (p) {
        var pair = p.split('=');
        var key = pair[0];
        var value = decodeURIComponent(pair[1] || '');

        if (result[key]) {
            if (Object.prototype.toString.call(result[key]) === '[object Array]') {
                result[key].push(value);
            } else {
                result[key] = [result[key], value];
            }
        } else {
            result[key] = value;
        }
    });

    return JSON.parse(JSON.stringify(result));
}
