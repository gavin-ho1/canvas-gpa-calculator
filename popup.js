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
  
  // Function to scrape information from the page
  function scrapeInfoFromPage() {
    // Example: get all numbers on the page
    const numbers = document.body.innerText.match(/\d+/g);
    return numbers ? numbers.join(', ') : 'No numbers found';
  }
  