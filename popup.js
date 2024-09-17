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

    let totalGrades = 0;  // To track the sum of all grades
    let totalMax = 0;     // To track the sum of all max values
    let count = 0;        // To count the number of valid grade pairs
  
    gradeSpans.forEach(span => {
        // Get the text from the <span class="grade">
        const gradeText = span.innerText;

        // Check if the grade text contains a percentage symbol and skip it
        if (gradeText.includes('%')) {
            return; // Skip this span if it contains a percentage symbol
        }

        // Extract the number from the <span class="grade">
        const gradeNumber = gradeText.match(/\d+(\.\d+)?/);  // Match the number or decimal in the span
        
        if (gradeNumber) {
            const gradeValue = parseFloat(gradeNumber[0]);  // Convert the grade to a number
            totalGrades += gradeValue;  // Add the grade value to the total sum

            // Look for the next <span> element that contains "/ [number]"
            const nextSpan = span.nextElementSibling;  // Get the next <span> element
    
            if (nextSpan && nextSpan.tagName === 'SPAN') {
                const nextText = nextSpan.innerText.trim();  // Get the text inside the next <span>
                const matchAfterSlash = nextText.match(/\/\s*(\d+(\.\d+)?)/);  // Match the number after the "/"
    
                if (matchAfterSlash) {
                    const numberAfterSlash = parseFloat(matchAfterSlash[1]);  // Extract the number and convert to float
                    totalMax += numberAfterSlash;  // Add the max value to the total sum
                    count++;  // Increment count
                }
            }
        }
    });

    // Return the total sum of grades and max values
    return `Total Grades: ${totalGrades}, Total Max: ${totalMax}, Percentage: ${(totalGrades/totalMax)*100}%`;
}
