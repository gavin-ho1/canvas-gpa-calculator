chrome.runtime.sendMessage({ type: 'print', data : "content.js is running" }, (response) => {});
var url 

chrome.runtime.sendMessage({ type: 'getURL' }, (response) => {
  url = response;
  
});

gradedAssigments = document.querySelectorAll("tr.student_assignment.assignment_graded.editable th.title div.context")
gradedAssigmentGrades = document.querySelectorAll("tr.student_assignment.assignment_graded.editable td.assignment_score div.score_holder span.tooltip span.grade")
gradedAssigmentGrades.forEach(gradeWrapper => {
    grade = gradeWrapper.textContent.replace(/Click to test a different score/g, '').trim()
    chrome.runtime.sendMessage({ type: 'print', data : grade}, (response) => {}); 
})

var weightedGradingEnabled = false

const gradeHeaders = document.querySelectorAll('h2')
gradeHeaders.forEach(header => {
  if(header.textContent.trim() === "Assignments are weighted by group:"){
    weightedGradingEnabled = true
    chrome.runtime.sendMessage({ type: 'print', data : "Grade Weighting Detected" }, (response) => {});
  }
})


var weightDict
if(weightedGradingEnabled){
  keys = document.querySelectorAll("table.summary th")
  var filteredKeys = []
  keys.forEach(key =>{
    if(key.innerHTML !== "Group" && key.innerHTML !== "Weight"&& key.innerHTML !== "Total"){
      filteredKeys.push(key.innerHTML)
    }
  })

  var filteredItems = []
  items = document.querySelectorAll('table.summary td')
  items.forEach(item => {
      if(item.innerHTML !== "100%"){
        filteredItems.push(item.innerHTML)
      }
  })
  // chrome.runtime.sendMessage({ type: 'print', data :  filteredKeys}, (response) => {});
  // chrome.runtime.sendMessage({ type: 'print', data : filteredItems }, (response) => {});

    weightDict = filteredKeys.reduce((acc, key, index) => {
    acc[key] = filteredItems[index];
    return acc;
  }, {});
    pointDict = filteredKeys.reduce((acc, key, index) => {
      acc[key] = 0;
      return acc;
    }, {}); 

  
}
//Debug Print
chrome.runtime.sendMessage({ type: 'print', data : weightDict }, (response) => {});
chrome.runtime.sendMessage({ type: 'print', data : pointDict }, (response) => {});

if(weightedGradingEnabled){
  const categoriesWrappers = document.querySelectorAll("div.context")
  categoriesList = []
  categoriesWrappers.forEach(div => {
    categoriesList.push(div.innerHTML)
  })
  const gradedAssigmentGradeWrappers = document.querySelectorAll("tr.student_assignment.assignment_graded.editable td.assignment_score div.score_holder span.tooltip span.grade")
  gradedAssigmentGradeWrappers.forEach(span => {
    num = span.innerHTML.match(/(\d+)/)[0]
    chrome.runtime.sendMessage({ type: 'print', data : num }, (response) => {});
  })
}

  var autoGradingEnabled = true

  const gradeDivs = document.querySelectorAll('#student-grades-final');

  // Loop through each of the found divs
  gradeDivs.forEach(div => {
      // Check if the text content matches "Calculation of totals has been disabled"
      if (div.textContent.trim() === "Calculation of totals has been disabled") {
          div.remove()
          autoGradingEnabled = false
      } 
  });

  gradedAssigments = document.querySelectorAll("tr.student_assignment.assignment_graded.editable")


  if(autoGradingEnabled === false){
    // Scrape numbers from span elements with the class "grade"
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
      const asideElement = document.getElementById('right-side-wrapper');
    input = ((totalGrades/totalMax)*100).toFixed(2);
  if (asideElement) {
      // Create a new div element
      const newDiv = document.createElement('div');

      // Add some content to the new div with the custom font size
      newDiv.innerHTML = `
          <div style="display: flex; flex-direction: row; align-items: center; justify-content: center; font-size: 1.2em; border-bottom: 1px solid #C7CDD1; border-top: 1px solid #C7CDD1;">
              <span class = "grade">Grade: ${input}%</span>
          </div>
      `;
      chrome.runtime.sendMessage({ type: 'getGrade', data: input }, (response) => {});
    

      // Insert the new div as the first child of the <aside> element
      asideElement.insertAdjacentElement('afterbegin', newDiv);
      
    }

  }else{
    //Need to find a workaround, or just calculate with weighted grade (gives same result)
}
