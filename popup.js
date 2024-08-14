// Initialization
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['blockedSites'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Failed to get blocked sites:", chrome.runtime.lastError);
        } else {
            const websitesContainer = document.getElementById('website-container');
            let blockedSites = result.blockedSites || []; 
            blockedSites.forEach((site, index) => {
                // Create li element 
                let li = document.createElement('li');
                li.textContent = site; 

                // Create delete element 
                let deleteButton = document.createElement('button');
                deleteButton.textContent = "Delete"; 

                // Create div element and add two li and delete elements into it 
                let div = document.createElement('div');
                div.className = 'list-website-div';
                div.appendChild(li);
                div.appendChild(deleteButton);

                // Finally add to website-container for each element 
                websitesContainer.appendChild(div);
            })
        }
    });
})

// main 
document.getElementById('addSite').addEventListener('click', () => { 
    let siteInput = document.getElementById('siteInput');
    // To clear the existing data later; 
    let site = siteInput.value;
    
    // whitespace is not approriate 
    if (site.trim()) {
        chrome.storage.sync.get(['blockedSites'], (result) => {
            let blockedSites = result.blockedSites || []; 
            blockedSites.push(site); 
            // clear existing site after pushing 
            siteInput.value = '';
            chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to set blocked sites:", chrome.runtime.lastError);
                } else {
                    // update the blocking rule 
                    updateBlockingRules(blockedSites);
    
                    // update to show immediately 
                    const websitesContainer = document.getElementById('website-container');
                    // Create li element 
                    let li = document.createElement('li');
                    li.textContent = site; 

                    // Create delete element 
                    let deleteButton = document.createElement('button');
                    deleteButton.textContent = "Delete"; 

                    // Create div element and add two li and delete elements into it 
                    let div = document.createElement('div');
                    div.className = 'list-website-div';
                    div.appendChild(li);
                    div.appendChild(deleteButton);

                    // Finally add to website-container for each element 
                    websitesContainer.appendChild(div);
                }
            });
        });
    } 
});

// Remove function 
document.getElementById('website-container').addEventListener('click', (event) => {
    console.log('Click detected:', event.target);
    if (event.target.tagName === 'BUTTON') {    //must be uppercase for tagName 
        console.log('hellloo')
        const button = event.target; 
        const removedSite = button.parentElement; 
        const sizeText = removedSite.querySelector('li').textContent; 

        // first remove in storage 
        chrome.storage.sync.get(['blockedSites'], (result) => {
            if (chrome.runtime.lastError) {
                console.log("Failed to get blocked sites:", chrome.runtime.lastError);
            } else {
                let blockedSites = result.blockedSites || []; 
                blockedSites = blockedSites.filter(site => site !== sizeText)

                chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
                    if (chrome.runtime.lastError) {
                        console.log("Failed to get blocked sites:", chrome.runtime.lastError);
                    } else {
                        updateBlockingRules(blockedSites);
                        removedSite.remove(); // then remove for HTML purpose. 
                    }
                })
            }
        })
    }
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