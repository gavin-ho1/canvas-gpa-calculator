document.getElementById('openUrlButton').addEventListener('click', () => {
  chrome.storage.sync.get('courseLinks', (result) => {
    urls = result.courseLinks
    idList = []
      urls.forEach(url => {
        chrome.runtime.sendMessage({ type: 'print', data: url });
        chrome.tabs.create({ url: url, active: false });
        
        chrome.tabs.remove(tab.id)
      });
    });
})

document.getElementById('link').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/gavin-ho1/canvas-gpa-calculator" });
});