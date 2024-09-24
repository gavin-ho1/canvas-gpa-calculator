//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabURL = tabs[0].url;
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
    chrome.runtime.sendMessage({ action: "URLRequest" }, (response) => {
      console.log("Response from service worker:", response);
    });
  });
});

