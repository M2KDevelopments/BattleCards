/* eslint-disable no-undef */
/**
 * author: Martin Kululanga
 * github: https://github.com/m2kdevelopments
 */
const headers = {
  'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
  'Content-Type': 'application/json; charset=utf-8',
};

const FIREBASE_SENDER_ID = "297012997658";

chrome.runtime.onInstalled.addListener(async function (details) {

  const INSTALL = "install", UPDATE = "update", CHROME_UPDATE = "chrome_update", SHARED_UPDATE = "shared_module_update";

  if (details.reason === INSTALL) chrome.tabs.create({ url: "https://crmsidekick.com/installed" });


  // Initialize Firebase Notifications
  if (details.reason === INSTALL || details.reason === UPDATE || details.reason === CHROME_UPDATE || details.reason === SHARED_UPDATE) {
    initFirebaseNotifications('https://www.crmsidekick.com');
    countNotifications();
    chrome.runtime.setUninstallURL(`https://crmsidekick.com/uninstalled`);
  }

  // create context menu
  chrome.contextMenus.create({ title: '𝗖𝗥𝗠 𝗦𝗶𝗱𝗲 𝗞𝗶𝗰𝗸 (Beta)', contexts: ['link', 'page'], id: "main" });
  chrome.contextMenus.create({ title: 'Facebook', contexts: ['link', 'page'], parentId: "main", id: "facebook" });
  chrome.contextMenus.create({ title: 'Instagram (Coming Soon)', contexts: ['link', 'page'], parentId: "main", id: "instagram" });
  chrome.contextMenus.create({ title: 'Youtube (Coming Soon)', contexts: ['link', 'page'], parentId: "main", id: "youtube" });
  chrome.contextMenus.create({ title: 'Linkedin (Coming Soon)', contexts: ['link', 'page'], parentId: "main", id: "linkedin" });

  // Facebook Options
  chrome.contextMenus.create({ title: 'Birthday Report', contexts: ['link', 'page'], parentId: "facebook", id: "birthday" });
  chrome.contextMenus.create({ title: "Friends' Report", contexts: ['link', 'page'], parentId: "facebook", id: "friendsreport" });
  chrome.contextMenus.create({ title: "Friend Requests", contexts: ['link', 'page'], parentId: "facebook", id: "friendsrequest" });
  chrome.contextMenus.create({ title: 'Add post to compare list', contexts: ['link', 'page'], parentId: "facebook", id: "compareposts" });
  chrome.contextMenus.create({ title: 'Add group to compare list', contexts: ['link', 'page'], parentId: "facebook", id: "comparegroups" });
});

//add listener for push notification to this service worker
this.onpush = (e) => {
  e.preventDefault();
  e.waitUntil(console.log(e.data.json()))
};

//Chrome firebase
chrome.gcm.onMessage.addListener((message) => {
  const { data } = message;
  const { content } = data;
  const json = JSON.parse(content);
  const { payload, body, id, title, bigPicture, largeIcon } = json;
  const { from, button1, button2, url } = payload;

  // Setup Buttons
  const buttons = []
  if (button1) buttons.push({ title: button1.title, url: button1.url })
  if (button2) buttons.push({ title: button2.title, url: button1.url });

  // Showing the Notifications
  if (bigPicture) {
    const notification = {
      title,
      message: body,
      contextMessage: `From ${from}`,
      iconUrl: largeIcon ? largeIcon : 'logo192.png',
      buttons: buttons.map(button => {
        return { title: button.title }
      }),
      imageUrl: bigPicture,
      type: "image"
    }
    chrome.notifications.create(id, notification);
    notification.url = url;
    notification.buttons = buttons
    addNotification(notification)
  } else {
    const notification = {
      title,
      message: body,
      contextMessage: `From ${from}`,
      iconUrl: largeIcon ? largeIcon : 'logo192.png',
      buttons: buttons,
      type: "basic"
    }
    chrome.notifications.create(id, notification);
    notification.url = url;
    addNotification(notification)

  }

  // Listeners for Events
  const buttonListener = (notificationId, buttonIndex) => {
    if (notificationId === id) {
      if (buttonIndex === 0 && button1.url) chrome.tabs.create({ url: button1.url })
      if (buttonIndex === 1 && button2.url) chrome.tabs.create({ url: button2.url })
    }
  }

  const notificationListener = (notificationId) => {
    if (notificationId === id && url) chrome.tabs.create({ url: url })
  }

  chrome.notifications.onButtonClicked.addListener(buttonListener)

  chrome.notifications.onClicked.addListener(notificationListener)

  chrome.notifications.onClosed.addListener((notificationId) => {
    if (notificationId === id) {
      chrome.notifications.onClicked.removeListener(notificationListener);
      chrome.notifications.onButtonClicked.removeListener(buttonListener);
    }
  })
});


// context menu list
chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.sendMessage(tab.id, { cid: "alert", message: "Shortcut options coming soon" })
});




chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // const { user } = await chrome.storage.local.get('user');
  // if (!user) return console.log('User not logged in');

  if (request.cid === "notification") {

    // Todo image nices images later on
    chrome.notifications.create({
      title: "Done Automation",
      iconUrl:"logo128.png",
      message: `👋🏽 Hey there, we've just finished your 🐶automation. Check your tabs and messenger to see your report.`,
      type: "progress",
      contextMessage: `𝗖𝗥𝗠 𝗦𝗶𝗱𝗲 𝗞𝗶𝗰𝗸: ${request.context}`,
      progress: 100,
      requireInteraction: true,
    })

    // goto report page
    chrome.tabs.update(sender.tab.id, { url: chrome.runtime.getURL(`index.html?fullscreen=true&${request.goto}`) })
  }

  sendResponse(true);
  return true;
})



async function initFirebaseNotifications(url) {

  const headers = {
    'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
    'Content-Type': 'application/json; charset=utf-8',
  }

  const chromeuser = await chrome.identity.getProfileUserInfo();
  const data = await chrome.storage.local.get('notificationId')


  chrome.gcm.register([FIREBASE_SENDER_ID], async (id) => {
    try {
      const body = JSON.stringify({
        gcm: id,
        notificationId: data.notificationId ? data.notificationId : "",
        platform: "chrome",
        ...chromeuser
      });

      //post to register for web push notification on the backend
      const responseWebpush = await fetch(`${url}/api/notifications`, { method: 'post', headers: headers, body: body });
      const json = await responseWebpush.json();

      //save notification in chrome storage
      chrome.storage.local.set({ 'notificationId': json.id }, () => console.log("Notification Setup"));
    } catch (e) {
      console.log(e.message);
    }
  })
}

async function addNotification(notification) {

  //get the notifications
  let { notifications } = await chrome.storage.local.get('notifications')
  if (!notifications) notifications = [];
  notification.date = Date.now();

  // push to array of notifications
  notifications.push(notification);

  // save to local storage
  await chrome.storage.local.set({ notifications });
  await countNotifications();

}

async function countNotifications() {

  let { notifications } = await chrome.storage.local.get('notifications')
  if (!notifications) notifications = [];
  const unread = notifications.filter(n => !n.read).length;

  //update badges
  if (!unread) {
    chrome.action.setBadgeText({ text: '' });
  } else {
    chrome.action.setBadgeText({ text: `${unread}` });
    chrome.action.setBadgeBackgroundColor({ color: "#FFD700" });
  }
}