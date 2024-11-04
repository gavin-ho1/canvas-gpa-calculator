document.getElementById('openUrlButton').addEventListener('click', () => {
  chrome.storage.sync.get('courseLinks', (result) => {
    urls = result.courseLinks
      urls.forEach(url => {
        chrome.runtime.sendMessage({ type: 'print', data: url });
        chrome.tabs.create({ url: url, active: false });
      });
      chrome.tabs.onUpdated.addListener(function onUpdated(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          console.log("Closing tab after load:", tabId);
          chrome.tabs.remove(tabId); // Close the tab
          chrome.tabs.onUpdated.removeListener(onUpdated); // Remove the listener to avoid unnecessary checks
        }

    });
})

document.getElementById('link').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/gavin-ho1/canvas-gpa-calculator" });
});