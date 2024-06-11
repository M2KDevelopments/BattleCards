/* eslint-disable no-undef */
//  https://www.facebook.com/friends/requests#crmsidekick_friendrequests
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Facebook Group Profile")

const timePosts = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_approvalquestions/)) {
        runQAndA();
        clearInterval(timePosts);
    }
}, 1000);


async function runQAndA() {


    const doc_id = '7127079110706541';
    const fbFriendlyName = 'GroupsCometMembershipQuestionsViewDialogQuery ';
    const groupID = getGroupID();
    const profileID = "100089078081011";

    const variables = { "groupID": groupID, "profileID": profileID, "scale": 1 };
    const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, true);

    // Get reported total
    const questionAndAnswers = json.data.group.membership.group_question_answers

    console.log("🐕‍🦺🐕‍🦺 Fetched Profile Q & A", questionAndAnswers)

}
