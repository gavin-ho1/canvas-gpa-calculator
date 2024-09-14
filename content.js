chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrape") {
      const headers = document.querySelectorAll('h1, h2');  // Target h1 and h2 headers
      let numbers = [];
  
      headers.forEach(header => {
        const text = header.innerText;
        const foundNumbers = text.match(/\d+/g);  // Find numbers in header text
        if (foundNumbers) {
          numbers = numbers.concat(foundNumbers);
        }
      });
  
      sendResponse(numbers.length > 0 ? numbers.join(', ') : 'No numbers found in headers');
    }
  });
  