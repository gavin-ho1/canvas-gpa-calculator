chrome.storage.sync.get('courseList', (result) => {
  urls = result.data
  urls = [chrome.extension.getURL("menus/gpa-scale.html")]
  document.getElementById('openUrlButton').addEventListener('click', () => {
    urls.forEach(url => {
      chrome.tabs.create({ url });
    });
  });
})

