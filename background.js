chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        return { cancel: true };
    }, 
    {urls: ["*://www.x.com/*"]},
    ["blocking"]
)