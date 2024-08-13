chrome.runtime.onInstalled.addListener(() => {

    // Websites to block for testings 
    const websitesToBlock = [
        "test-website.com",
        "another-test-website.com",
    ]
    
    // An array for websites 
    const dynamicWebsitesArray = websitesToBlock.map((site, index) => ({
        id: index + 1, 
        priority: 1, 
        action: { type: "block" },
        condition: {
            urlFilter: site,
            resourceTypes: ["main_frame"]
        }
    })); 

    console.log('hello: ', dynamicWebsitesArray);

    //main 
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2],
        addRules: dynamicWebsitesArray
    }, () => {
        console.log("Dynamic blocking rules have been added.")
    })
})