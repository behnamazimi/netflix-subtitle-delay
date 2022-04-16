'use strict';

chrome.runtime.onMessage.addListener(handleMessages)
document.addEventListener("DOMContentLoaded", init)

const {sendGlobalMessage} = messagingUtils;

let options = null;
let subtitleElm = null;
let delayedSubtitleElm = null;

const orgElmObserver = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      updateDelayedSubtitle(mutation.target)
    }
  }
})

function init() {
  sendGlobalMessage({action: globalActions.INIT}, (res) => {
    options = res.options
    startObservation();
  })
}

function startObservation() {

  let checkCount = 0
  const lookingToastMsg = showToast("Looking for subtitle stuff in the code...", 0)

  // find original subtitle element on the document
  // and clone it within its parent
  // and start observe
  let checkElementInterval = setInterval(() => {
    checkCount++;
    subtitleElm = document.querySelector(options.elementSelector)
    if (subtitleElm) {
      delayedSubtitleElm = subtitleElm.cloneNode(true)
      for (let cls of delayedSubtitleElm.classList) {
        delayedSubtitleElm.classList.remove(cls)
      }
      delayedSubtitleElm.classList.add("delayed")
      subtitleElm.parentNode.insertBefore(delayedSubtitleElm, subtitleElm)
      orgElmObserver.observe(subtitleElm, {attributes: true, childList: true, subtree: true});

      // add style to hide original styles
      let style = document.createElement("style")
      style.innerText = `body ${options.elementSelector} *{display:none!important;text-shadow:none!important;color:transparent!important}`
      document.head.appendChild(style)

      clearInterval(checkElementInterval)
      showToast("Delay applied :)")
      lookingToastMsg.remove()
    }

    // in the case of not finding the subtitle element
    if (checkCount > 5) {
      clearInterval(checkElementInterval)
      lookingToastMsg.remove()
      showToast("Could not find the target subtitle element in the Netflix codes alter 10 seconds .", 5000)
    }
  }, 2000)
}

function updateDelayedSubtitle(updatedTarget) {
  const delay = (+options.delay * 1000) || 0

  const nextContent = updatedTarget.innerHTML
  const nextStyles = updatedTarget.getAttribute("style")
  setTimeout(() => {
    delayedSubtitleElm.setAttribute("style", nextStyles)
    delayedSubtitleElm.innerHTML = nextContent;
  }, delay);
}

function handleMessages(data) {
  if (data.action === globalActions.OPTIONS_UPDATE) {
    options = data.options
    showToast("Delay time updated.")
  }
}

function showToast(msg, hideDelay = 3000) {
  if (!msg) return
  let msgElm = document.createElement("div")
  msgElm.classList.add("dnst-toast")
  msgElm.innerText = msg
  document.body.appendChild(msgElm)

  if (!hideDelay) {
    return msgElm
  }

  setTimeout(() => {
    msgElm.remove()
    msgElm = null
  }, hideDelay)
}

// start subtitle observation on url change
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    startObservation()
  }
}).observe(document, {childList: true, subtree: true});

