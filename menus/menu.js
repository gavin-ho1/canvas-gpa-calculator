chrome.storage.sync.get('courseList', (result) => {
  urls = result.data
  document.getElementById('openUrlButton').addEventListener('click', () => {
    urls.forEach(url => {
      chrome.tabs.create({ url });
    });
  });
})

