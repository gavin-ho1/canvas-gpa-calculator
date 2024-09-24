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
      

      // Create a local dictionary
      const localDictionary = {};

      // Add the URL as a key and data value to the dictionary
      chrome.runtime.sendMessage({ type: 'grade' }, (response) => {
        const grade = response;
        console.log(grade)
      });
      localDictionary[url] = {
        data: grade
      };

      // Save the dictionary to Chrome sync storage
      chrome.storage.sync.set({ localDictionary }, () => {});
    });

    // Retrieve the dictionary from Chrome sync storage on page load
    chrome.storage.sync.get('localDictionary', (result) => {
      if (result.localDictionary) {
        localDictionary = result.localDictionary;
        console.log('Dictionary:', result.localDictionary);
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'myMessage') {
      console.log('Received message:', request.data);
      sendResponse({ message: 'Message received' });
  }
});