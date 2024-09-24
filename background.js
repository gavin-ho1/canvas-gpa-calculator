//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabURL = tabs[0].url;
    chrome.scripting.executeScript(tabs[0].id, { file: "content.js" });
    
  });
});

//Recive and message from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "URLRequest") {
    sendResponse({ response: tabs[0].url });
  }
});