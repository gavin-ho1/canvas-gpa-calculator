//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabURL = tabs[0].url;
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
  });
});

var url
var grade

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getURL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      url = tabs[0].url;
      sendResponse({ url });
    }); 
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'getGrade') {
          grade = request.data
          chrome.storage.sync.get('localDictionary', (result) => {
            const localDictionary = result.localDictionary || {}; // Initialize if not present
            localDictionary[url] = {
              data: grade
            };
          
            chrome.storage.sync.set({ localDictionary }, () => {
              console.log(localDictionary);
            });
          });
      }
  });

  }
});
