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
    const gradeSpans = document.querySelectorAll('span.grade');  // Target <span class="grade">
    
    let numbers = [];
  
    gradeSpans.forEach(span => {
      const text = span.innerText;
      const foundNumbers = text.match(/\d+(\.\d+)?/g);  // Find numbers in the text
      if (foundNumbers) {
        numbers = numbers.concat(foundNumbers);
      }
    });
  
    return numbers.length > 0 ? numbers.join(', ') : 'No numbers found in <span class="grade">';
  }
  