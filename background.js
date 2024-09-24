//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabURL = tabs[0].url;
    chrome.scripting.executeScript(tabs[0].id, { file: "content.js" });
    
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getURL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;

      const regex = /courses\/(\d+)\/grades/; // Matches digits after "courses/"
      const match = regex.exec(url);

      if (match) {
        const courseID = match[1];  // The captured group (digits)
        // Do something with the extracted course number
      }
      console.log(courseID)
      sendResponse({ courseID });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'log') {
    console.log(request.message);
  }
});