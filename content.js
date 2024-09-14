// Example of scraping numbers or specific text from the webpage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrape") {
      // Scraping all numbers from the page
      const numbers = document.body.innerText.match(/\d+/g);
      sendResponse(numbers ? numbers.join(', ') : 'No numbers found');
    }
  });
  