chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrape") {
      const gradeSpans = document.querySelectorAll('span.grade');  // Target <span class="grade">
      let numbers = [];
  
      gradeSpans.forEach(span => {
        const text = span.innerText;
        const foundNumbers = text.match(/\d+(\.\d+)?/g);  // Find numbers in the text
        if (foundNumbers) {
          numbers = numbers.concat(foundNumbers);
        }
      });
  
      sendResponse(numbers.length > 0 ? numbers.join(', ') : 'No numbers found in <span class="grade">');
    }
  });
  