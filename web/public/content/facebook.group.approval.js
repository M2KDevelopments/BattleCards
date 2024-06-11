console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Group Approval")
/* eslint-disable no-undef */

const timeGroupApproval = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_approvalgroup/gmi)) {
        runGroupApproval();
        clearInterval(timeGroupApproval);
    }
}, 1000);


async function runGroupApproval() {
    const delay = (seconds = 4) => new Promise((resolve, reject) => setTimeout(resolve, seconds * 1000))
    const doc_id = '6701126709988943';
    const fbFriendlyName = 'CometGroupMemberRequestsRootQuery';
    const groupID = getGroupID();
    let cursor = null;

    // Map to collect people
    const people = new Map();
    const limit = 300;
    let counter = 0;


    // GroupsCometMemberRequestsContetnPaginationQuery
    // variables:{
    //     count:10,
    //     cursor:"",
    //     groupID:"",
    //     hide_admin_approved_members:false, 
    //     named:"",
    //     orderby:['firest_possible_ordering'],
    //     pending_member_filter:{filters:[]},
    //     scale:1,
    //     id:""//same a group id

    // }
    // doc_id:7176955815765037

    do {
 
        const variables = {
            "count": 10,
            "cursor": cursor,
            "currentSection": "MEMBER_REQUESTS",
            "groupID": groupID,
            "hide_admin_approved_members": false,
            "named": "",
            "orderby": ["first_possible_ordering"],
            // "pending_member_filters": {
            //     "filters": [
            //         {
            //             "filter_type": "JOINED_FB_RECENTLY",
            //             "filter_values": ["more_than_one_year"]
            //         }
            //     ]
            // },
            "pro_tip_surface": "MEMBER_REQUESTS_QUEUE",
            "scale": 1
        }
        const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, true);

        // if there are errors stop the loop
        if (json.errors) {
            console.log(json.errors);
            break;
        }
 

        // loop through the members
        console.log(json)


        // setup for next page
        // cursor = json.data.node.new_members.page_info.end_cursor
        // if (json.data.node.new_members.page_infohas_next_page) break;;
        await delay(5);
        counter += json.data.node.new_members.edges.length;
        console.log('🐕‍🦺🐕‍🦺 Fetching', counter, 'out of', limit);
    } while (people.size < limit && counter < limit);

    console.log(people);
}
