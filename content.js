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
 

// Find the target element with the ID "student-grades-right-content"
const targetElement = document.getElementById('student-grades-final');

if (targetElement) {
    // Create a new div element
    const newDiv = document.createElement('div');

    // Add some content to the new div
    newDiv.innerHTML = `
        <div style="border: 1px solid black; padding: 20px; margin: 10px; background-color: lightgreen;">
            <h2>Injected HTML Content</h2>
            <p>This div was injected inside #student-grades-final at the end.</p>
        </div>
    `;

    // Append the new div as a child at the end of #student-grades-right-content
    targetElement.appendChild(newDiv);
}
