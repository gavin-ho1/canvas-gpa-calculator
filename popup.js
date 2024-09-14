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
    // Select all <span> elements with the class "grade"
    const gradeSpans = document.querySelectorAll('span.grade');  // Selects all <span class="grade">
  
    let results = [];
  
    gradeSpans.forEach(span => {
      // Get the number from the <span class="grade">
      const gradeText = span.innerText;
      const gradeNumber = gradeText.match(/\d+(\.\d+)?/);  // Match the number or decimal in the span
      let gradeInfo = gradeNumber ? `Grade: ${gradeNumber[0]}` : 'Grade: N/A';
  
      // Get the value immediately after the span (sibling)
      const nextText = span.nextSibling && span.nextSibling.textContent ? span.nextSibling.textContent.trim() : '';
      const matchAfterSlash = nextText.match(/\/\s*(\d+(\.\d+)?)/);  // Match the number after the "/"
      
      if (matchAfterSlash) {
        const numberAfterSlash = matchAfterSlash[2];
        gradeInfo += ', Max: ${numberAfterSlash}';  // Append the "max" number
      } else {
        gradeInfo += ', Max: N/A';
      }
  
      results.push(gradeInfo);
    });
  
    return results.length > 0 ? results.join('; ') : 'No grades found';
  }
  