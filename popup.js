document.getElementById('scrape-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: scrapeInfoFromPage
      }, (results) => {
        const output = document.getElementById('output');
        output.textContent = results[0].result;
      });
    });
  });
 
  // Scrape numbers from span elements with the class "grade"
  function scrapeInfoFromPage() {
    chrome.scripting.executeScript({ 
      target: { tabId: tab.id },
      files: ['content.js']
   })
}