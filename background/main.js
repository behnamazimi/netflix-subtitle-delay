'use strict';

chrome.runtime.onMessage.addListener(handleMessages)

chrome.tabs.onActivated.addListener(handleTabActivation);
chrome.tabs.onUpdated.addListener(handleTabUpdate);

function handleMessages(data, details, sendResponse) {
  switch (data.action) {
    case globalActions.INIT:
    case globalActions.POPUP_INIT:
      storeUtils.loadOptions((res) => {
        sendResponse(res);
      })
      return true;
    case globalActions.SET_OPTIONS:
      storeUtils.storeOptions(data.options);
      messagingUtils.sendMessageToCurrentTab({
        action: globalActions.OPTIONS_UPDATE,
        options: data.options
      })
      sendResponse(true)
      return true;
  }

}

function handleTabActivation(tabInfo) {
  const tabId = tabInfo.tabId || tabInfo.id;
  chrome.tabs.get(tabId, ({url} = {}) => {
    updateExtStatusInTab(tabId, url)
  })
}

function handleTabUpdate(tabId, {status}) {
  if (status === "complete")
    handleTabActivation({tabId})
}

function updateExtStatusInTab(tabId, url) {
  if (!tabId) return;

  const isAllowed = !!url && (~url.indexOf("https://netflix.com") || ~url.indexOf("https://www.netflix.com"))
  let iconPath = {
    "16": `icons/${isAllowed ? "" : "d_"}16x16.png`,
    "32": `icons/${isAllowed ? "" : "d_"}32x32.png`,
    "48": `icons/${isAllowed ? "" : "d_"}48x48.png`,
    "128": `icons/${isAllowed ? "" : "d_"}128x128.png`
  }

  if (isAllowed) {
    chrome.browserAction.enable(tabId);
  } else {
    setTimeout(() => {
      chrome.browserAction.disable(tabId);
    }, 10)
  }

  // update icon
  chrome.browserAction.setIcon({tabId: tabId, path: iconPath});
}
