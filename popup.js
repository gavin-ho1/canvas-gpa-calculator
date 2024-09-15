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
  
  function getLetterGrade(percentage) {
    if (percentage >= 97) {return "A+"}
    if (percentage >= 93) {return 'A'};
    if (percentage >= 90) {return 'A-'};
    if (percentage >= 87) {return 'B+'};
    if (percentage >= 83) {return 'B'};
    if (percentage >= 80) {return 'B-'};
    if (percentage >= 77) {return 'C+'};
    if (percentage >= 73) {return 'C'};
    if (percentage >= 70) {return 'C-'};
    if (percentage >= 67) {return 'D+'};
    if (percentage >= 63) {return 'D'};
    if (percentage >= 60) {return 'D-'};
    return 'F';
}

  // Scrape numbers from span elements with the class "grade"
  function scrapeInfoFromPage() {
    // Select all <span> elements with the class "grade"
    const gradeSpans = document.querySelectorAll('span.grade');  // Selects all <span class="grade">

    let totalPercentage = 0;
    let count = 0; // To count the number of grades processed
  
    gradeSpans.forEach(span => {
        // Get the number from the <span class="grade">
        const gradeText = span.innerText;
        const gradeNumber = gradeText.match(/\d+(\.\d+)?/);  // Match the number or decimal in the span
        
        if (gradeNumber) {
            const gradeValue = parseFloat(gradeNumber[0]);  // Convert the grade to a number
            
            // Look for the next <span> element that contains "/ [number]"
            const nextSpan = span.nextElementSibling;  // Get the next <span> element
    
            if (nextSpan && nextSpan.tagName === 'SPAN') {
                const nextText = nextSpan.innerText.trim();  // Get the text inside the next <span>
                const matchAfterSlash = nextText.match(/\/\s*(\d+(\.\d+)?)/);  // Match the number after the "/"
    
                if (matchAfterSlash) {
                    const numberAfterSlash = parseFloat(matchAfterSlash[1]);  // Extract the number and convert to float
                    
                    // Calculate the percentage
                    const percentage = (gradeValue / numberAfterSlash) * 100;
                    totalPercentage += percentage;
                    count++;  // Increment count
                }
            }
        }
    });

    // Calculate the average percentage
    const averagePercentage = count > 0 ? (totalPercentage / count).toFixed(2) : 0.00;

    // Get the letter grade
    const letterGrade = getLetterGrade(parseFloat(averagePercentage));

    return `${letterGrade}`;
}