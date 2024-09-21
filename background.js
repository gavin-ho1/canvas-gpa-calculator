chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {  // Run after page is fully loaded
    chrome.scripting.executeScript({
      target: {tabId: tabId},
      files: ['contentScript.js']
    });
  }
});
