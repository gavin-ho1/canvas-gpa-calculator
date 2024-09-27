//Debug Print
chrome.runtime.sendMessage({ type: 'print', data : "content.js is running" }, (response) => {});

var weightedGradingEnabled = false

//Check for Weighted Grade
const gradeHeaders = document.querySelectorAll('h2')
gradeHeaders.forEach(header => {
  if(header.textContent.trim() === "Assignments are weighted by group:"){
    weightedGradingEnabled = true
    chrome.runtime.sendMessage({ type: 'print', data : "Grade Weighting Detected" }, (response) => {});
  }
})

//Create weighted assigments dict for calculation refernce
var filteredKeys = []
var filteredItems = []

if(weightedGradingEnabled){
    keys = document.querySelectorAll("table.summary th")
    
    keys.forEach(key =>{
      if(key.innerHTML !== "Group" && key.innerHTML !== "Weight"&& key.innerHTML !== "Total"){
        filteredKeys.push(key.innerHTML)
      }
    })
  
    items = document.querySelectorAll('table.summary td')
    items.forEach(item => {
        if(item.innerHTML !== "100%"){
          filteredItems.push(item.innerHTML)
        }
    })
}

//Will be final reference
var weightDict = {}
var pointDict = {}

for(const key in filteredKeys){
weightDict[filteredKeys[key]] = filteredItems[key]
pointDict[filteredKeys[key]] = [0,0]
}

//Debug
chrome.runtime.sendMessage({ type: 'print', data : "weightDict: "+weightDict }, (response) => {});

//Scraping
//Pull <tr> HTML element that has been graded
gradedAssigments = document.querySelectorAll("tr.student_assignment.assignment_graded.editable div.content")

//Pull <div.context> and <span.grades> for Assigment Type and Assigment points, respectively
gradedAssigmentTypes = document.querySelectorAll("tr.student_assignment.assignment_graded.editable th.title div.context")

gradedAssigmentGradesWrapper = document.querySelectorAll("tr.student_assignment.assignment_graded.editable td.assignment_score div.score_holder span.tooltip span.grade")

//Append to List
var earnedPoints
var totalPoints
gradedAssigmentGradesWrapper.forEach(gradeWrapper => {
    //Get Earned Score
    grade = gradeWrapper.textContent.replace(/Click to test a different score/g, '').trim()
    chrome.runtime.sendMessage({ type: 'print', data : grade }, (response) => {});
    earnedPoints.push(grade)

    //Get Total Score
    total = gradeWrapper.nextElementSibling.textContent.replace("/","").trim()
    chrome.runtime.sendMessage({ type: 'print', data : total }, (response) => {});
    totalPoints.push(total)

})

chrome.runtime.sendMessage({ type: 'print', data : earnedPoints }, (response) => {});

chrome.runtime.sendMessage({ type: 'print', data : totalPoints }, (response) => {});