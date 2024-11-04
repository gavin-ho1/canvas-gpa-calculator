document.getElementById('openUrlButton').addEventListener('click', () => {
  chrome.storage.sync.get('courseLinks', (result) => {
    const urls = result.courseLinks; // Access the courseLinks property

    if (Array.isArray(urls) && urls.length > 0) {
      // Create a new window for the tabs
      chrome.windows.create({
        url: 'about:blank', // Temporary blank page to create the window
        type: 'popup', // Create a popup window
        focused: false // The window will not be focused
      }, (newWindow) => {
        console.log("New window created:", newWindow.id);

        // Open each URL in the new window
        urls.forEach(url => {
          chrome.tabs.create({ url: url, windowId: newWindow.id, active: false }, (tab) => {
            console.log("Opened tab in new window:", tab.id);

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

        // Optionally, close the window after a certain time or immediately
        // You can close the new window after a timeout
        setTimeout(() => {
          chrome.windows.remove(newWindow.id, () => {
            if (chrome.runtime.lastError) {
              console.error("Error closing window:", chrome.runtime.lastError.message);
            } else {
              console.log(`Window with ID ${newWindow.id} has been closed.`);
            }
          });
        }, 5000); // Close the window after 5 seconds (adjust as needed)
      });
    } else {
      console.warn("No URLs found or courseLinks is not an array.");
    }
  });
});




document.getElementById('link').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/gavin-ho1/canvas-gpa-calculator" });
});