'use strict';

const {sendMessageToCurrentTab, sendGlobalMessage} = messagingUtils;

let saveBtn = document.getElementById('save-btn');
let delayInput = document.getElementById("delay")
let selectorInput = document.getElementById("elementSelector")

// find active tab and init popup
getActiveTabInfo(() => {
  initPopup();
})

saveBtn.onclick = function () {
  let delay = delayInput.value
  let elementSelector = selectorInput.value

  if (!+delay) delay = defaultDelay

  if (!elementSelector) elementSelector = defaultSelector

  let options = {delay, elementSelector}
  sendGlobalMessage({action: globalActions.SET_OPTIONS, options}, () => {
    window.close()
  })
}

function initPopup() {
  sendGlobalMessage({action: globalActions.POPUP_INIT}, ({options = {}}) => {
    delayInput.value = options.delay || defaultDelay
    selectorInput.value = options.elementSelector || defaultSelector
  });
}

function getActiveTabInfo(cb) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const activeTab = tabs ? tabs[0] : {};
    cb && typeof cb === "function" && cb(activeTab)
  });
}
