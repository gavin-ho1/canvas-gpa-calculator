document.getElementById('openUrlButton').addEventListener('click', () => {
chrome.storage.sync.get('courseLinks', (result) => {
  urls = result.data
  urls.forEach(url => {
    chrome.tabs.create({ url: url });
  });
  });
})

document.getElementById('link').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/gavin-ho1/canvas-gpa-calculator" });
});