// Initialize time 
const defaultValue = "unlimited"
let selectedValue = defaultValue 

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['blockedSites', 'countDownDate'], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Failed to get blocked sites:", chrome.runtime.lastError);
        } else {
            // Handle time - default time is unlimited 
            if (result.countDownDate) {
                let remainingTime = result.countDownDate - new Date().getTime(); 
                if (remainingTime > 0) {
                    countDownTime(remainingTime / (60 * 1000));
                } else {
                    document.getElementById("countdown").innerHTML = 'Time is up'; 
                }
            } else {
                document.getElementById("countdown").innerHTML = "Unlimited time";
            }

            // Loading all the blocked sites for the first initialization
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

// Select button
document.getElementById('selectedOptionBtn').addEventListener('click', () => {
    let form = document.getElementById('optionsForm'); 
    let selectedOption = form.querySelector('input[name="option"]:checked');

    // display the chosen one 
    if (selectedOption) {
        selectedValue = selectedOption.value; 
        document.getElementById('selectedOption').innerText = `You selected: ${selectedValue} minutes`; 
        document.getElementById("countdown").innerHTML = '';
        // refresh to make sure that ok 
        window.location.reload();
        if (selectedValue !== "unlimited") {
            let timeInMinutes = Number(selectedValue)
            let countDownDate = new Date().getTime() + timeInMinutes * 60 * 1000;

            // save the countdown date end time 
            chrome.storage.sync.set({ countDownDate: countDownDate }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to save countdown date:", chrome.runtime.lastError);
                } else {
                    countDownTime(timeInMinutes);
                }
            })
        } else {
            chrome.storage.sync.remove('countDownDate', () => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to clear countdown date:", chrome.runtime.lastError);
                } else {
                    document.getElementById("countdown").innerHTML = "Unlimited time";
                }
            })
        }
    }
})

// Remove function 
document.getElementById('website-container').addEventListener('click', (event) => {
    console.log('Click detected:', event.target);
    if (event.target.tagName === 'BUTTON') {    //must be uppercase for tagName 
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

function countDownTime(time) {      // time is in minute 
    // Only 3 options: 30 or 60 or unlimited time 
    let countDownDate = new Date().getTime() + time * 60 * 1000; //change to milliseconds
    let x = setInterval(() => {
        let now = new Date().getTime(); 
        let distance = countDownDate - now;
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)); 
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        document.getElementById("countdown").innerHTML = `${minutes} m ${seconds} s`;

        // Countdown is done, show to users 
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("countdown").innerHTML = 'Time is up!';
        }

    }, 1000);
}