chrome.storage.sync.get('courseLinks', (result) => {
  urls = result.data
  document.getElementById('openUrlButton').addEventListener('click', () => {
    urls.forEach(url => {
      chrome.tabs.create({ url });
    });
  });
})

document.getElementById('link').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/gavin-ho1/canvas-gpa-calculator" });
});