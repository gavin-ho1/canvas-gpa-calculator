//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabURL = tabs[0].url;
    console.log(tabURL)
    alert("A")
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
    
  });
});