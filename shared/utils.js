'use strict';

const messagingUtils = (function () {

    function sendMessageToCurrentTab(body) {
        chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
            if (tabs && tabs[0])
                chrome.tabs.sendMessage(tabs[0].id, body);
        });
    }

    function sendMessageToAllTabs(body) {
        chrome.tabs.query({}, function (tabs) {
            for (let i = 0; i < tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, body);
            }
        });
    }

    function sendGlobalMessage(body, cb) {
        chrome.runtime.sendMessage(body, cb);
    }

    return {
        sendMessageToCurrentTab,
        sendMessageToAllTabs,
        sendGlobalMessage,
    }
})();

const storeUtils = (function () {

    function storeOptions(data, cb) {
        chrome.storage.sync.set({"options": data}, function () {
            if (cb && typeof cb === "function") cb(data)
        });
    }

    function loadOptions(cb) {
        chrome.storage.sync.get("options", function (data) {
            if (cb && typeof cb === "function")
                cb(data)
        });
    }

    return {
        storeOptions,
        loadOptions
    }
})();



