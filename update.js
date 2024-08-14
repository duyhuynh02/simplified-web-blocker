export function updateBlockingRules(sites) {
    // An array for websites 
    const dynamicWebsitesArray = sites.map((site, index) => ({
        id: index + 1, 
        priority: 1, 
        action: { type: "block" },
        condition: {
            urlFilter: `://${site}/*`,
            resourceTypes: ["main_frame"]
        }
    })); 

    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: Array.from({ length: sites.length }, (_, index) => index + 1),
        addRules: dynamicWebsitesArray
    }, () => {
        console.log("Dynamic blocking rules have been added.")
    })
}