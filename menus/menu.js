document.getElementById('openUrlButton').addEventListener('click', () => {
  chrome.storage.sync.get('courseLinks', (result) => {
    const urls = result.courseLinks; // Access the courseLinks property

    if (Array.isArray(urls) && urls.length > 0) {
      urls.forEach(url => {
        // Open the URL in a new popup window (not focused)
        chrome.windows.create({
          url: url,
          type: 'popup', // This creates a window that is minimally intrusive
          focused: false // The window will not be focused
        }, (window) => {
          // After creating the window, get the tab ID
          chrome.tabs.query({ windowId: window.id }, (tabs) => {
            tabs.forEach(tab => {
              // Listen for updates to the tab
              chrome.tabs.onUpdated.addListener(function onUpdated(updatedTabId, changeInfo) {
                // Check if this is the tab we opened and if it's fully loaded
                if (updatedTabId === tab.id && changeInfo.status === 'complete') {
                  console.log("Tab is fully loaded. Closing tab:", tab.id);
                  chrome.tabs.remove(tab.id, () => {
                    if (chrome.runtime.lastError) {
                      console.error("Error closing tab:", chrome.runtime.lastError.message);
                    } else {
                      console.log(`Tab with ID ${tab.id} has been closed.`);
                    }
                  });
                  // Remove the listener to prevent it from firing for other tabs
                  chrome.tabs.onUpdated.removeListener(onUpdated);
                }
              });
            });
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