chrome.storage.sync.get('courseList', (result) => {
  urls = result.data
  urls = ["https://www.google.com/"]
  document.getElementById('openUrlButton').addEventListener('click', () => {
    urls.forEach(url => {
      chrome.tabs.create({ url });
    });
  });
})

