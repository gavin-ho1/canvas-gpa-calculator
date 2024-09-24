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
      // console.log(url)
      
      // Create a local dictionary
      const localDictionary = {};

      // Add the URL as a key and data value to the dictionary
      localDictionary[url] = {
        // Your data value here
        data: 'Some data associated with the URL'
      };

      // Save the dictionary to Chrome sync storage
      chrome.storage.sync.set({ localDictionary }, () => {
        console.log('Dictionary saved to Chrome sync storage');
      });
    });

    // Retrieve the dictionary from Chrome sync storage on page load
    chrome.storage.sync.get('localDictionary', (result) => {
      if (result.localDictionary) {
        localDictionary = result.localDictionary;
        console.log('Dictionary retrieved from Chrome sync storage');
        console.log('Dictionary:', result.localDictionary);
      }

      sendResponse({ url });
    });
  }
});