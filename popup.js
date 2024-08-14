// main 
document.getElementById('addSite').addEventListener('click', () => { 
    let siteInput = document.getElementById('siteInput');
    let site = siteInput.value;
    chrome.storage.sync.get(['blockedSites'], (result) => {
        let blockedSites = result.blockedSites || []; 
        blockedSites.push(site); 
        // clear existing site after push 
        siteInput.value = '';
        chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
            if (chrome.runtime.lastError) {
                console.error("Failed to set blocked sites:", chrome.runtime.lastError);
            } else {
                updateBlockingRules(blockedSites);
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['blockedSites'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Failed to get blocked sites:", chrome.runtime.lastError);
        } else {
            const websitesContainer = document.getElementById('website-container');
            let blockedSites = result.blockedSites || []; 
            blockedSites.forEach((site, index) => {
                let li = document.createElement('li');
                li.textContent = site; 
                websitesContainer.appendChild(li);
            })
        }
    });
})


function updateBlockingRules(sites) {
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