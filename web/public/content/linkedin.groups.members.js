/* eslint-disable no-undef */
console.log("🐕‍🦺🐕‍🦺 CRM Side Kick on Group Members")

const timeGroupMembers = setInterval(() => {
    if (window.location.href.match(/#crmsidekick_groupmembers/)) {
        runGroupMembers();
        clearInterval(timeGroupMembers);
    }
}, 1000);


async function runGroupMembers() {
    const data = getLinkedinGroupJSON();
    const csrf = getCSRFToken()
    if (data) {
        const { headers, request, body, method } = data;
        headers['Csrf-Token'] = csrf;
        const res = await fetch(request, { headers, method });
        console.log(await res.json());
    } else console.log("Could not find group settings");
}

function getLinkedinGroupJSON() {
    const codes = document.getElementsByTagName('code')
    for (const code of codes) {
        if (code.textContent.includes(`"request"`) && code.textContent.includes(`GroupMembers`)) {
            return JSON.parse(code.textContent)
        }
    }
    return null;
}

function getCSRFToken() {

    for (const a of document.getElementsByTagName('a')) {
        if (a.getAttribute('data-tracking') && a.href.includes("csrfToken")) {
            const start = a.href.indexOf("csrfToken=") + "csrfToken=".length;
            const end = a.href.indexOf("&", start);
            return a.href.substring(start, end).replace("ajax%3A", "");
        }
        return "";
    }

}


runGroupMembers()