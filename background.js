//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabURL = tabs[0].url;
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
  });
});

var url
var grade
var courseID

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getURL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      url = tabs[0].url;
      const regex = /(\d+)/; // Matches digits after "courses/"
      courseID = url.match(regex);

      sendResponse({ courseID });
    }); 
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

      //Get grade of current page
      if (request.type === 'getGrade') {
          grade = request.data
          chrome.storage.sync.get('localDictionary', (result) => {
            const localDictionary = result.localDictionary || {}; // Initialize if not present
            console.log(url)
            localDictionary[courseID] = {
              grade: grade
            };
          
            chrome.storage.sync.set({ localDictionary }, () => {
              console.log(localDictionary);
            });
          });
      }
  });

  }
});
