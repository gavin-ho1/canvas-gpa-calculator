//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabURL = tabs[0].url;
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getURL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      sendResponse({ url });
    }); 
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'getGrade') {
          console.log('Received message:', request.data);
      }
  });

  }
});
