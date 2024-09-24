//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    tabURL = tabs[0].url;
    console.log(tabURL)
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
    
  });
});