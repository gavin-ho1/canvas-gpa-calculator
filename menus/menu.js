document.getElementById('openUrlButton').addEventListener('click', () => {
  chrome.storage.sync.get('courseLinks', (result) => {
    const urls = result.courseLinks; // Access the courseLinks property

    if (Array.isArray(urls) && urls.length > 0) {
      let tabsLoaded = 0;

      urls.forEach(url => {
        // Open the URL in a new tab (not active)
        chrome.tabs.create({ url: url, active: false }, (tab) => {
          console.log("Opened tab:", tab.id);

          // Listen for updates to the tab
          chrome.tabs.onUpdated.addListener(function onUpdated(updatedTabId, changeInfo) {
            // Check if this is the tab we opened and if it's fully loaded
            if (updatedTabId === tab.id && changeInfo.status === 'complete') {
              console.log("Tab is fully loaded. Closing tab:", tab.id);

              // Close the tab
              chrome.tabs.remove(tab.id, () => {
                if (chrome.runtime.lastError) {
                  console.error("Error closing tab:", chrome.runtime.lastError.message);
                } else {
                  console.log(`Tab with ID ${tab.id} has been closed.`);
                  
                  // Increment the count of loaded tabs
                  tabsLoaded++;

                  // If all tabs are loaded and closed, log completion
                  if (tabsLoaded === urls.length) {
                    console.log("All tabs have been loaded and closed.");
                  }
                }
              });

              // Remove the listener to prevent it from firing for other tabs
              chrome.tabs.onUpdated.removeListener(onUpdated);
            }
          });
        });
      });
    } else {
      console.warn("No URLs found or courseLinks is not an array.");
    }
  });
});



document.getElementById('link').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/gavin-ho1/canvas-gpa-calculator" });
});

document.getElementById('settings').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("menus/options.html") });
});

document.getElementById('clear').addEventListener('click', () => {
  chrome.storage.sync.clear(() => {
    if (chrome.runtime.lastError) {
      console.error("Error clearing local storage:", chrome.runtime.lastError.message);
    } else {
      document.getElementById('output').innerText = "Cleared!"
      console.log("Local storage cleared successfully.");
    }
  });  
});