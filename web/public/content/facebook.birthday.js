/* eslint-disable no-undef */
// https://web.facebook.com/events/birthdays#crmsidekick_birthday
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Facebook Birthdays")

const timeBirthday = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_birthday/)) {
        runBirthday();
        clearInterval(timeBirthday);
    }
}, 1000);

async function runBirthday() {
    const delay = (seconds = 4) => new Promise((resolve, reject) => setTimeout(resolve, seconds * 1000))
    const doc_id = '25138804392433184';
    const fbFriendlyName = 'BirthdayCometMonthlyBirthdaysRefetchQuery';
    const months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    console.log("🐕‍🦺 Fetching birthdays");

    // Map to collect people
    const people = new Map();

    // show UI from function/popup.js
    createPopupUI();

    // Collecting Birthdays
    for (let i in months) {
        const variables = { "count": 2, "cursor": `${i}`, "offset_month": 0, "scale": 1 };
        const json = await facebookGraphQL(fbFriendlyName, variables, doc_id, true);
        for (const edge of json.data.viewer.all_friends_by_birthday_month.edges) {
            const { node } = edge;
            const { month_name_in_iso8601, friends } = node;
            for (const e of friends.edges) {

                // profile data
                const { birthdate, id, name, profile_picture } = e.node;
                const image = profile_picture.uri;

                // calculate age
                const date = new Date(birthdate.year, birthdate.month + 1, birthdate.day);
                const age = new Date().getFullYear() - date.getFullYear()

                people.set(id, {
                    name, id, image, month: month_name_in_iso8601, birthdate, age
                })
            }
        }

        console.log("🐕‍🦺🐕‍🦺 Fetching Birthdays", i, 'out of', months.length);
        const percentage = parseInt(i * 100.0 / months.length);

        //from function/popup.js
        updateProgress(`🐕‍🦺🐕‍🦺 Fetching those birthdays (${percentage}%) Go boy!`, percentage);

        await delay(4);
    }

    const ctx = document.createElement('canvas');
    ctx.width = 1024;
    ctx.height = 768;

    const monthlyBirthdays = [];
    const list = Array.from(people.values());
    for (const i in months) {
        const month = months[i];
        const count = list.filter(person => person.month.toLowerCase() === month.toLowerCase()).length
        monthlyBirthdays[i] = count;
    }

    console.log("🐕‍🦺🐕‍🦺 Fetched birthdays", list.length)

    // save to chrome storage
    await chrome.storage.local.set({
        birthday: {
            monthlyBirthdays,
            people: list,
        }
    });

    // send signal to background.js to display notification
    chrome.runtime.sendMessage({ cid: "notification", context: "Birthday Report", type: "birthday", goto: "reports_birthday" });
 
}


