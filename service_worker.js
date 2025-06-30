
function getMapping() {
  return JSON.parse(localStorage['VivochaOnTheFly'] || '{}');
}

function updateHandler(tab) {
  chrome.browserAction.setBadgeText({text:''});
  chrome.tabs.executeScript(
    null, {file:"vivocha-extension.js"});
}

chrome.tabs.onUpdated.addListener(updateHandler);
chrome.tabs.onCreated.addListener(updateHandler);

function findMatchingAccount(url) {
  var mp = getMapping();
  for(var acct in mp) {
    var rgx = mp[acct];
    for (var i in rgx.patterns) {
      if (url.match(rgx.patterns[i]))
        return {'account' : acct, 'world' : rgx.world};
    }
  }
  return {'account' : null, 'world' : null};
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message == "waiting-account") {
    var acct = findMatchingAccount(sender.tab.url);
    sendResponse({account: acct.account, world: acct.world });
  } else if (request.message == "vivocha-enabled") {
      chrome.browserAction.setIcon({path: '/img/on_16.png'})
    //chrome.browserAction.setBadgeBackgroundColor({color:[0, 200, 0, 100]});
    //chrome.browserAction.setBadgeText({text:'On'});
  } else if (request.message == "vivocha-disabled") {
      chrome.browserAction.setIcon({path: '/img/off_16.png'})
    //chrome.browserAction.setBadgeBackgroundColor({color:[0, 100, 0, 0]});
    //chrome.browserAction.setBadgeText({text:'Off'});
  } else if (request.message == "vivocha-insert") {
    updateHandler();
  }
});

chrome.tabs.onActivated.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.tabId, {message: "update-vivocha-state"})
});

