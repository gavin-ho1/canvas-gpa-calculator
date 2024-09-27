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

//Create weighted assigments dict
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
    var weightDict = {}
  
    for(const key in filteredKeys){
      weightDict[filteredKeys[key]] = filteredItems[key]
    }
  
    chrome.runtime.sendMessage({ type: 'print', data : "weightDict: "+weightDict }, (response) => {});
  }

//Pull <tr> HTML element that has been graded
gradedAssigments = document.querySelectorAll("tr.student_assignment.assignment_graded.editable div.content")
