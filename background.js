chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (changeInfo.status == "complete" && tab.url) {
      // other checks for my use case here, then: 
      chrome.scripting.executeScript({ 
          target: { tabId: tab.id },
          files: ['content.js']
       })
  }
});
