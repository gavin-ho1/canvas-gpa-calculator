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
    let totalGrade = 0;
    let totalMax = 0;
  
    gradeSpans.forEach(span => {
        // Get the number from the <span class="grade">
        const gradeText = span.innerText;
        const gradeNumber = gradeText.match(/\d+(\.\d+)?/);  // Match the number or decimal in the span
        
        if (gradeNumber) {
            const gradeValue = parseFloat(gradeNumber[0]);  // Convert the grade to a number
            totalGrade += gradeValue;  // Add to total grade
            
            let gradeInfo = `Grade: ${gradeValue}`;
            
            // Look for the next <span> element that contains "/ [number]"
            const nextSpan = span.nextElementSibling;  // Get the next <span> element
    
            if (nextSpan) {
                const nextText = nextSpan.innerText.trim();  // Get the text inside the next <span>
                const matchAfterSlash = nextText.match(/\/\s*(\d+(\.\d+)?)/);  // Match the number after the "/"
    
                if (matchAfterSlash) {
                    const numberAfterSlash = parseFloat(matchAfterSlash[1]);  // Extract the number and convert to float
                    totalMax += numberAfterSlash;  // Add to total max
                    gradeInfo += `, ${numberAfterSlash}`;  // Append the number after the "/"
                }
            }
            
            results.push(gradeInfo);  // Add the result to the array
        }
    });

    // Generate the summary results
    const resultText = results.length > 0 ? results.join(', ') : 'No grades found';
    const totalsText = `Total Grades: ${totalGrade.toFixed(2)}, Total Max: ${totalMax.toFixed(2)}`;

    return `${resultText}; ${totalsText}`;
}
