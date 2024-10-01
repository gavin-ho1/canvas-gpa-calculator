chrome.runtime.sendMessage({ type: 'print', data : "content.js is running" }, (response) => {});
var courseID 

// chrome.runtime.sendMessage({ type: 'getID' }, (response) => {
  hyperLink = document.querySelector("a.mobile-header-title.expandable")
  courseID = hyperLink.href.match(/\d+/)
  chrome.runtime.sendMessage({ type: 'print', data : "CourseID: " +courseID }, (response) => {});
  
// });

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
var finalGradeDict = {}

var categoriesList = []
var gradeList = []
var totalPointList = []


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

    const categoriesWrappers = document.querySelectorAll("div.context")
  
    categoriesWrappers.forEach(div => {
      categoriesList.push(div.innerHTML)
    })
    const gradedAssigmentGradeWrappers = document.querySelectorAll("td.assignment_score span.grade")
    
    gradedAssigmentGradeWrappers.forEach(span => {
      // chrome.runtime.sendMessage({ type: 'print', data : span.innerHTML.trim() }, (response) => {}); 
      num = span.innerHTML.trim().match(/\d+(\.\d+)?$/) //Get numbers without percentage signs next to them
  
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
    for(index in gradeList){
      if(gradeList[index] !== "--"){
        pointDict[categoriesList[index]] += gradeList[index]
        totalPointDict[categoriesList[index]] += totalPointList[index]
      }
    
    }
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
    //Debug Print
// chrome.runtime.sendMessage({ type: 'print', data : weightDict }, (response) => {});
// chrome.runtime.sendMessage({ type: 'print', data : pointDict }, (response) => {});

// chrome.runtime.sendMessage({ type: 'print', data : categoriesList }, (response) => {});
// chrome.runtime.sendMessage({ type: 'print', data : gradeList }, (response) => {});
// chrome.runtime.sendMessage({ type: 'print', data : totalPointList }, (response) => {});



// chrome.runtime.sendMessage({ type: 'print', data : pointDict }, (response) => {}); 
// chrome.runtime.sendMessage({ type: 'print', data : totalPointDict }, (response) => {}); 
}else{
  gradedAssigmentGradeWrappers = document.querySelectorAll("tr.student_assignment.assignment_graded.editable td.assignment_score div.score_holder span.tooltip span.grade")

  var points = 0
  var totalPoints = 0
  gradedAssigmentGradeWrappers.forEach(span => {
    num = parseFloat(span.innerHTML.match(/(\d+)/)[0])
    points += num
    totalPoints += parseFloat(span.nextElementSibling.innerHTML.match(/(\d+)/)[0])
    
  })
  finalGrade = ((points/totalPoints)*100).tofixed(2)
}






chrome.runtime.sendMessage({ type: 'print', data : "Final Grade: "+finalGrade+"%" }, (response) => {}); 

  const gradeDivs = document.querySelectorAll('#student-grades-final');
  // Loop through each of the found divs
gradeDivs.forEach(div => {
    // Check if the text content matches "Calculation of totals has been disabled"
    if (div.textContent.trim() === "Calculation of totals has been disabled") {
        div.textContent = "Total: "+finalGrade+"%"
    } 
});

