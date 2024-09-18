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
        
        // Ensure a valid grade number is found
        if (gradeNumber) {
            const gradeValue = parseFloat(gradeNumber[0]);  // Convert the grade to a number

            // Look for the next <span> element that contains "/ [number]"
            const nextSpan = span.nextElementSibling;  // Get the next <span> element

            // Ensure the next element exists and is a <span>
            if (nextSpan && nextSpan.tagName === 'SPAN') {
                const nextText = nextSpan.innerText.trim();  // Get the text inside the next <span>
                const matchAfterSlash = nextText.match(/\/\s*(\d+(\.\d+)?)/);  // Match the number after the "/"
    
                // Ensure a valid number after the slash is found
                if (matchAfterSlash) {
                    const numberAfterSlash = parseFloat(matchAfterSlash[1]);  // Extract the number and convert to float

                    // Now that both gradeValue and numberAfterSlash are valid, add them to the totals
                    totalGrades += gradeValue;  // Add the grade value to the total sum
                    totalMax += numberAfterSlash;  // Add the max value to the total sum
                    count++;  // Increment count only when both values are valid
                }
            }
        }
    });

    // Return the total sum of grades and max values
    return `Grade: ${((totalGrades/totalMax)*100).toFixed(2)}%`;
}



document.getElementById('injectButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: injectHtml
      });
  });
});

function injectHtml(input) {
  // Find the target <aside> element with the ID "right-side-wrapper"
const asideElement = document.getElementById('right-side-wrapper');
  input = int(scrapeInfoFromPage());
if (asideElement) {
    // Create a new div element
    const newDiv = document.createElement('div');

    // Add some content to the new div with the custom font size
    newDiv.innerHTML = `
        <div style="font-size: 1.2em; border: 1px solid black; padding: 20px; margin: 10px;">
            <p>Grades: ${input}</p>
        </div>
    `;

    // Insert the new div as the first child of the <aside> element
    asideElement.insertAdjacentElement('afterbegin', newDiv);
}

}
