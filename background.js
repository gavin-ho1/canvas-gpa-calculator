//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(tabs[0].id, { files: ["content.js", "IDlogger.js"] });
  });
});

//ID Logger attempt (WIP)
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  var activeTab = tabs[0];
  var url = activeTab.url;

  // Check if the URL matches a specific domain or host
  if (url.includes(".instructure.com")) {
    console.log("URL matches the specified domain");

    var regex = /\/courses\/(\d+)\//;
    var match = regex.exec(url);

    if (match) {
      var courseID = match[1];
      console.log("Course ID:", courseID);
    } else {
      console.log("URL doesn't match the expected format.");
    }
  } else {
    console.log("URL doesn't match the specified domain");
  }
});
