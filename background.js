//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
  });
});

//pull url and courseID on page load
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  var activeTab = tabs[0];
  var url = activeTab.url;
  console.log(url)
  var regex = /\/courses\/(\d+)\//;
    var match = regex.exec(url);

    if (match) {
      var courseID = match[1];
      console.log("Course ID:", courseID);
    } else {
      console.log("URL doesn't match the expected format.");
    }
});