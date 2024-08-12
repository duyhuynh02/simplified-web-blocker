//Initialization
document.getElementById('addSite').addEventListener('click', () => { 
    let site = document.getElementById('siteInput').value;
    chrome.storage.sync.get(['blockedSites'], (result) => {
        let blockedSites = result.blockedSites || []; 
        blockedSites.push(site); 
        chrome.storage.sync.set({ blockedSites: blockedSites })
    });
});