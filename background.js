//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
  });
});

//pull url and courseID on page load
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    var url = tab.url;

    // Extract the numbers using regular expression
    var regex = /\/courses\/(\d+)\//;
    var match = regex.exec(url);

    if (match) {
      var courseId = match[1];
      console.log("Course ID:", courseId);
    } else {
      console.log("URL doesn't match the expected format.");
    }
  }
});