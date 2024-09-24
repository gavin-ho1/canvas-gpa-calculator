//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabURL = tabs[0].url;
    console.log(tabURL)
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
    
  });
});

//Recive and message from content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting === "hello")
      sendResponse({farewell: "goodbye"});
  }
);