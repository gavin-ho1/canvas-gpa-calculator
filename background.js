chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
  });
  
  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrape") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: scrapeInfoFromPage
        }, (results) => {
          sendResponse({ result: results[0].result });
        });
      });
      return true;  // Keeps the message channel open for async response
    }
  });
  
  function scrapeInfoFromPage() {
    // Select specific headers (e.g., h1 and h2 tags)
    const headers = document.querySelectorAll('span.grade');  // You can add more header tags if needed
  
    let numbers = [];
  
    // Loop through the selected header elements and extract numbers
    headers.forEach(header => {
      const text = header.innerText;
      const foundNumbers = text.match(/\d+(\.\d+)?/g);  // Match numbers in the text
      if (foundNumbers) {
        numbers = numbers.concat(foundNumbers);
      }
    });
  
    return numbers.length > 0 ? numbers.join(', ') : 'No numbers found in headers';
  }
  
  