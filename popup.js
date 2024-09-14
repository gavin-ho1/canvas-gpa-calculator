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
  
  // Scrape numbers only from h1 and h2 headers
  function scrapeInfoFromPage() {
    const headers = document.querySelectorAll('h1, h2');  // Target h1 and h2 headers
  
    let numbers = [];
  
    headers.forEach(header => {
      const text = header.innerText;
      const foundNumbers = text.match(/\d+/g);  // Find numbers in header text
      if (foundNumbers) {
        numbers = numbers.concat(foundNumbers);
      }
    });
  
    return numbers.length > 0 ? numbers.join(', ') : 'No numbers found in headers';
  }
  