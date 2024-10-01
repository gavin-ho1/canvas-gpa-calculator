chrome.runtime.sendMessage({ type: 'print', data : "content.js is running" }, (response) => {});
var url 

chrome.runtime.sendMessage({ type: 'getURL' }, (response) => {
  url = response;
  
});

gradedAssigments = document.querySelectorAll("tr.student_assignment.assignment_graded.editable th.title div.context")
gradedAssigmentGrades = document.querySelectorAll("tr.student_assignment.assignment_graded.editable td.assignment_score div.score_holder span.tooltip span.grade")
gradedAssigmentGrades.forEach(gradeWrapper => {
    grade = gradeWrapper.textContent.replace(/Click to test a different score/g, '').trim()
    // chrome.runtime.sendMessage({ type: 'print', data : grade}, (response) => {}); 
})

var weightedGradingEnabled = false

const gradeHeaders = document.querySelectorAll('h2')
gradeHeaders.forEach(header => {
  if(header.textContent.trim() === "Assignments are weighted by group:"){
    weightedGradingEnabled = true
    chrome.runtime.sendMessage({ type: 'print', data : "Grade Weighting Detected" }, (response) => {});
  }
})


var weightDict = {}
var pointDict = {}
var totalPointDict = {}

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
  // chrome.runtime.sendMessage({ type: 'print', data : filteredKeys}, (response) => {});
  // chrome.runtime.sendMessage({ type: 'print', data : filteredItems}, (response) => {});

    weightDict = filteredKeys.reduce((acc, key, index) => {
    acc[key] = parseFloat(filteredItems[index].replace("%",""));
    return acc;
  }, {});
    pointDict = filteredKeys.reduce((acc, key, index) => {
      acc[key] = 0;
      return acc;
    }, {});
    totalPointDict = filteredKeys.reduce((acc, key, index) => {
      acc[key] = 0;
      return acc;
    }, {});  

  
}
//Debug Print
// chrome.runtime.sendMessage({ type: 'print', data : weightDict }, (response) => {});
// chrome.runtime.sendMessage({ type: 'print', data : pointDict }, (response) => {});

var categoriesList = []
var gradeList = []
var totalPointList = []

if(weightedGradingEnabled){
  const categoriesWrappers = document.querySelectorAll("div.context")
  
  categoriesWrappers.forEach(div => {
    categoriesList.push(div.innerHTML)
  })
  const gradedAssigmentGradeWrappers = document.querySelectorAll("td.assignment_score span.grade")
  
  gradedAssigmentGradeWrappers.forEach(span => {
    // chrome.runtime.sendMessage({ type: 'print', data : span.innerHTML.trim() }, (response) => {}); 
    num = span.innerHTML.trim().match(/(\d+)/)
    if(num){
      // chrome.runtime.sendMessage({ type: 'print', data : "Grade  detected" }, (response) => {}); 
      gradeList.push(parseFloat(num[0]))
      totalPointList.push(parseFloat(span.nextElementSibling.innerHTML.replace("/","")))
    }else{
      // chrome.runtime.sendMessage({ type: 'print', data : "Grade not detected" }, (response) => {}); 
      gradeList.push("--")
      totalPointList.push("--")
    }
   
    
  })
}
// chrome.runtime.sendMessage({ type: 'print', data : categoriesList }, (response) => {});
// chrome.runtime.sendMessage({ type: 'print', data : gradeList }, (response) => {});
// chrome.runtime.sendMessage({ type: 'print', data : totalPointList }, (response) => {});

for(index in gradeList){
  if(gradeList[index] !== "--"){
    pointDict[categoriesList[index]] += gradeList[index]
    totalPointDict[categoriesList[index]] += totalPointList[index]
  }

}

// chrome.runtime.sendMessage({ type: 'print', data : pointDict }, (response) => {}); 
// chrome.runtime.sendMessage({ type: 'print', data : totalPointDict }, (response) => {}); 

var finalGradeDict = {}

filteredKeys.forEach(category => {
  // chrome.runtime.sendMessage({ type: 'print', data : pointDict[category]/totalPointDict[category] }, (response) => {}); 
  if(totalPointDict[category] !== 0){ //Check for div by zero
    finalGradeDict[category] = pointDict[category]/totalPointDict[category]
  }else{
    finalGradeDict[category] = "NaN"
  }

})

// chrome.runtime.sendMessage({ type: 'print', data : finalGradeDict }, (response) => {}); 

var finalGrade = 0

filteredKeys.forEach(category => {
  if(finalGradeDict[category] !== "NaN"){
    chrome.runtime.sendMessage({ type: 'print', data : finalGradeDict[category]*weightDict[category] }, (response) => {}); 
    finalGrade += finalGradeDict[category]*weightDict[category]
  }
  
})

finalGrade = finalGrade.toFixed(2)

chrome.runtime.sendMessage({ type: 'print', data : "Final Grade: "+finalGrade+"%" }, (response) => {}); 

//BREAK









  const gradeDivs = document.querySelectorAll('#student-grades-final');
  // Loop through each of the found divs
gradeDivs.forEach(div => {
    // Check if the text content matches "Calculation of totals has been disabled"
    if (div.textContent.trim() === "Calculation of totals has been disabled") {
        div.textContent = "Hi"
    } 
});

gradedAssigments = document.querySelectorAll("tr.student_assignment.assignment_graded.editable")


// Return the total sum of grades and max values
const asideElement = document.getElementById('right-side-wrapper');
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

