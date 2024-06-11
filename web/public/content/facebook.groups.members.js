/* eslint-disable no-undef */
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Group Members")

const timeGroupMembers = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_groupmembers/)) {
        runGroupMembers();
        clearInterval(timeGroupMembers);
    }
}, 1000);


async function runGroupMembers() {
    const delay = (seconds = 4) => new Promise((resolve, reject) => setTimeout(resolve, seconds * 1000))
    const doc_id = '7524923467527191';
    const fbFriendlyName = 'GroupsCometMembersPageNewMembersSectionRefetchQuery';
    const groupID = getGroupID();
    let cursor = null;

    // Map to collect people
    const people = new Map();
    const limit = 300;
    let counter = 0;



    do {
        const variables = {
            "count": 10,
            "cursor": cursor,
            "groupID": groupID,
            "recruitingGroupFilterNonCompliant": false,
            "scale": 1,
            "id": groupID
        };
        const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, true);

        // if there are errors stop the loop
        if (json.errors) {
            console.log(json.errors);
            break;
        }

        // if there are no members
        if (!json.data.node.new_members) {
            console.log('Could not get new members');
            await delay(5);
            continue;
        }


        // loop through the members
        for (const edge of json.data.node.new_members.edges) {
            const { node, invite_status_text, join_status_text } = edge;
            const { bio_text, id, is_verified, name, profile_picture, user_type_renderer, __isEntity } = node?.invitee_profile || node;


            // check if user info is present
            if (__isEntity !== 'User' && __isEntity !== "GroupUserInvite") {
                console.log(name, 'is not a valid user');
                continue;
            }

            if (!user_type_renderer) {
                console.log(name, 'is not a valid user');
                continue;
            }

            const { user } = user_type_renderer;
            const join = join_status_text?.text || "";
            const invite = invite_status_text?.text || ""  //"Invited by Mae Robinson about 3 weeks ago"
            const bio = bio_text ? bio_text.text : "";
            const image = profile_picture.uri;
            const verified = is_verified;
            const friendship_status = user?.friendship_status || "N/A";

            //add people to map
            people.set(id, {
                id,
                name,
                image,
                bio,
                invite,
                join,
                verified,
                friendship_status
            })

        }


        // setup for next page
        cursor = json.data.node.new_members.page_info.end_cursor
        if (json.data.node.new_members.page_infohas_next_page) break;;
        await delay(5);
        counter += json.data.node.new_members.edges.length;
        console.log('🐕‍🦺🐕‍🦺 Fetching', counter, 'out of', limit);
    } while (people.size < limit && counter < limit);

    console.log(people.length)
    chrome.runtime.sendMessage({ cid: "next", automationId: window.location.href.replace(/.*___/gmi, ''), people: Array.from(people.values()) });
}
