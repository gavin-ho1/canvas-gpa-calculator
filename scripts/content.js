function print(description = "", content){
  chrome.runtime.sendMessage({ type: 'print', description : description, data : content })
}
print("Debug:", "content.js is running")
var courseID 


dashboardSpan = document.querySelector("span.mobile-header-title") //Detect for dashboard/homepage
if(dashboardSpan){
  print("Debug:", "Dashboard page detected") 
  var GPA = 0
  chrome.storage.sync.get('courseDict', (result) => {
    const courseDict = result.courseDict
    Object.keys(courseDict).forEach(key => {
      gradePoint = courseDict[key].gradePoint
      // chrome.runtime.sendMessage({ type: 'print', data : GPA }, (response) => {})
      GPA += gradePoint
    })
    GPA /= Object.keys(courseDict).length
    chrome.runtime.sendMessage({ type: 'print', description : "Calculated GPA from chrome.storage.sync.get(): ", data : GPA }, (response) => {}); // GPA variable must be within chrome.storage.sync.get(), otherwise the variable doesn't get saved
    
    //Put HTML inject here:

    //Recursive to inject HTML into dynamic content 
    //Basically checks if titleSpan exists, and injects. If not, wait and try again
    function findTitleSpan() {
      const titleSpan = document.querySelector("#dashboard_header_container > div > span > span:nth-child(1) > span > span");
      
      if (titleSpan) {
          chrome.runtime.sendMessage({ type: 'print', description : "Detected titleSpan: ",data: titleSpan.textContent }, (response) => {}); 
          titleSpan.innerHTML += " ǀ GPA: " + GPA;
      } else {
          // Retry after 100ms if the element is not found
          setTimeout(findTitleSpan, 100);
      }
  }
  
  // Start checking for the element
  findTitleSpan();
  

    // Do Later
    //If Card View
    cardViewDivs = document.querySelectorAll("div.ic-DashboardCard__header_hero")

    //If List View
    listViewDiv = document.querySelector("div.css-1sp24u-text")

    //If Recent Activity View
    recentViewDiv = document.querySelector("h2.recent-activity-header")
    
    if(cardViewDivs){
      //Inject html for a card
    }else if (listViewDiv){
      //Inject html at top of list
    }else if(recentViewDiv){
      //Inject html above "Recent Activity" div
    }


  })
   
  
}else{

  hyperLink = document.querySelector("a.mobile-header-title.expandable")
  courseID = hyperLink.href.match(/\d+/)
  chrome.runtime.sendMessage({ type: 'print', description : "courseID", data : courseID }, (response) => {});
    


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
  var finalGrade = 0


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
          // chrome.runtime.sendMessage({ type: 'print', data :  span.nextElementSibling.innerHTML.replace("/","") }, (response) => {});  
        }else{
          // chrome.runtime.sendMessage({ type: 'print', data : "Grade not detected" }, (response) => {}); 
          gradeList.push(0)
          totalPointList.push(0)
        }
      
        
      })
      chrome.runtime.sendMessage({ type: 'print', description : "gradeList = ", data : gradeList }, (response) => {});  
      chrome.runtime.sendMessage({ type: 'print', description : "totalPointList = ", data : totalPointList }, (response) => {}); 
      for(index in gradeList){
        // if(gradeList[index] !== ""){
          pointDict[categoriesList[index]] += gradeList[index]
          totalPointDict[categoriesList[index]] += totalPointList[index]
        // }
      
      }
      chrome.runtime.sendMessage({ type: 'print', description : "weightDict = ", data : weightDict }, (response) => {});   
      chrome.runtime.sendMessage({ type: 'print', description : "pointDict = ", data : pointDict }, (response) => {});  
      chrome.runtime.sendMessage({ type: 'print', description : "totalPointDict = ", data : totalPointDict }, (response) => {}); 

      
      filteredKeys.forEach(category => {
        if(totalPointDict[category] !== 0){ //Check for div by zero
          finalGradeDict[category] = pointDict[category]/totalPointDict[category]
        }else{
          finalGradeDict[category] = "NaN"
        }
        chrome.runtime.sendMessage({ type: 'print', data : totalPointDict[category] }, (response) => {}); 
      })
      
      chrome.runtime.sendMessage({ type: 'print', data : finalGradeDict }, (response) => {}); 
      

      
      filteredKeys.forEach(category => {
        if(finalGradeDict[category] !== "NaN" || weightDict[category] !== null){
          chrome.runtime.sendMessage({ type: 'print', description : "finalGradeDict[category] = ",data : finalGradeDict[category] }, (response) => {});
          chrome.runtime.sendMessage({ type: 'print', description : "weightDict[category] = ",data : weightDict[category] }, (response) => {});  
          chrome.runtime.sendMessage({ type: 'print', description : "finalGradeDict[category]*weightDict[category] = ",data : finalGradeDict[category]*weightDict[category] }, (response) => {}); 
          finalGrade += finalGradeDict[category]*weightDict[category]
        }else{
          chrome.runtime.sendMessage({ type: 'print', data : "NaN" }, (response) => {});  
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
    finalGrade = (points/totalPoints)*100
    finalGrade = finalGrade.toFixed(2)
  }

  var letterGrade = "";

  //I'm not stupid, its just that js won't accept composite functions, which is why there is a lack of functions in this entire script
  if (finalGrade >= 97) {
    letterGrade = "A+";
  } else if (finalGrade >= 93) {
    letterGrade = "A";
  } else if (finalGrade >= 90) {
    letterGrade = "A-";
  } else if (gradfinalGradee >= 87) {
    letterGrade = "B+";
  } else if (finalGrade >= 83) {
    letterGrade = "B";
  } else if (finalGrade >= 80) {
    letterGrade = "B-";
  } else if (finalGrade >= 77) {
    letterGrade = "C+";
  } else if (finalGrade >= 73) {
    letterGrade = "C";
  } else if (finalGrade >= 70) {
    letterGrade = "C-";
  } else if (finalGrade >= 67) {
    letterGrade = "D+";
  } else if (finalGrade >= 63) {
    letterGrade = "D";
  } else if (finalGrade >= 60) {
    letterGrade = "D-";
  } else {
    letterGrade = "F";
  }
  chrome.runtime.sendMessage({type: "print", data : letterGrade})
  
  chrome.runtime.sendMessage({type: "getGrade", data : [finalGrade,courseID,letterGrade]})


  chrome.runtime.sendMessage({ type: 'print', data : "Final Grade: "+finalGrade+"% ("+letterGrade+")" }, (response) => {}); 

    const gradeDivs = document.querySelectorAll('#student-grades-final');
    // Loop through each of the found divs
  gradeDivs.forEach(div => {
      // Check if the text content matches "Calculation of totals has been disabled"
      if (div.textContent.trim() === "Calculation of totals has been disabled") {
        div.remove()
          
      } 
  });
  

  //If final grade exists, delete (use same recursive to delete dynamic content)
  if(document.querySelector("div.student_assignment.final_grade")){
    function findGradeSpan() {
      const gradeSpan = document.querySelector("div.student_assignment.final_grade");
      
      if (gradeSpan) {
        chrome.runtime.sendMessage({ type: 'print', data : "Deleting gradeSpan" }, (response) => {}); 
          chrome.runtime.sendMessage({ type: 'print', data: gradeSpan.textContent }, (response) => {}); 
          gradeSpan.remove()
      } else {
          // Retry after 100ms if the element is not found
          setTimeout(findGradeSpan, 100);
      }
  }
  findGradeSpan()
  }

  const displayAside = document.querySelector("#right-side") 

  displayAside.innerHTML = `<div id="student-grades-final" class="student_assignment final_grade" style="font-size: 1.2em;">Total: ${finalGrade}% (${letterGrade})</div>` + displayAside.innerHTML
  
}
