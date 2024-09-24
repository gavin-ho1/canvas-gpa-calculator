chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
  });
});
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  var activeTab = tabs[0];
  var url = activeTab.url;
  console.log('hi'+url);
});