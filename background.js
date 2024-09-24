//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(tabs[0].id, { files: ["content.js"] });
  });
});

(async () => {
  // see the note below on how to choose currentWindow or lastFocusedWindow
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  console.log(tab.url);
  // ..........
})();

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { action: "hello", data: "world" }, (response) => {
    console.log("Response from content script:", response);
  });
});