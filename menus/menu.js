chrome.storage.sync.get('courseList', (result) => {
  urls = result.data
  urls = [chrome.extension.getURL("goa-scale.html")]
  document.getElementById('openUrlButton').addEventListener('click', () => {
    urls.forEach(url => {
      chrome.tabs.create({ url });
    });
  });
})

