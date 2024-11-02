const urls = ['https://example1.com',
  'https://example2.com',
  'https://example3.com']
document.getElementById('openUrlButton').addEventListener('click', () => {
  urls.forEach(url => {
    chrome.tabs.create({ url });
  });
});
