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
    const numbers = document.body.innerText.match(/\d+/g);
    return numbers ? numbers.join(', ') : 'No numbers found';
  }
  