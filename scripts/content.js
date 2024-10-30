chrome.runtime.sendMessage({ type: 'print', data : "content.js is running" }, (response) => {});
var courseID 


dashboardSpan = document.querySelector("span.mobile-header-title") //Detect for dashboard/homepage
if(dashboardSpan){
  chrome.runtime.sendMessage({ type: 'print', data : "dashboard page detected" }, (response) => {}); 
  var GPA = 0
  chrome.storage.sync.get('courseDict', (result) => {
    const courseDict = result.courseDict
    Object.keys(courseDict).forEach(key => {
      gradePoint = courseDict[key].gradePoint
      // chrome.runtime.sendMessage({ type: 'print', data : GPA }, (response) => {})
      GPA += gradePoint
    })
    GPA /= Object.keys(courseDict).length
    chrome.runtime.sendMessage({ type: 'print', data : GPA }, (response) => {}); // GPA variable must be within chrome.storage.sync.get(), otherwise the variable doesn't get saved
    
    //Put HTML inject here:

    //Recursive to inject HTML into dynamic content 
    //Basically checks if titleSpan exists, and injects. If not, wait and try again
  

    // Do Later
    //If Card View
    cardViewDivs = document.querySelectorAll("div.ic-DashboardCard__header_hero")

    //If List View
    listViewDiv = document.querySelector("div.css-1sp24u-text")

    //If Recent Activity View
    recentViewDiv = document.querySelector("h2.recent-activity-header")

    betterCanvas = document.querySelector("#bettercanvas-aesthetics")
    
      //Inject html for a card
    if(betterCanvas){
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.classList.contains('bettercanvas-card-grade'))   
       {
                injectCard();
              }
              if (node.classList.contains("bettercanvas-gpa-card")){
                injectGPA()
              }
            });
          }
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      

      function injectCard(){
        const betterCanvasCards = document.querySelectorAll("a.bettercanvas-card-grade")
        if(betterCanvasCards.length !== 0){
          chrome.runtime.sendMessage({ type: 'print', data : "Better Canvas detected" }, (response) => {}); 
          betterCanvasCards.forEach(card => {
            chrome.runtime.sendMessage({ type: 'print', data : card.innerHTML }, (response) => {}); 
            url = card.href
            chrome.runtime.sendMessage({ type: 'print', data : url }, (response) => {}); 
            Object.keys(courseDict).forEach(key => {
              
              if(url.match(key)){
                chrome.runtime.sendMessage({ type: 'print', data : courseDict[key].grade }, (response) => {}); 
                card.textContent = `${courseDict[key].grade}%`
              }
            })
          })
        }else{
          setTimeout(injectCard,100)
        }
      }
      
      


      function injectGPA(){
        gpaCardUnweighted = document.querySelector("#bettercanvas-gpa-unweighted")
        gpaCardWeighted = document.querySelector("#bettercanvas-gpa-weighted")

        if(gpaCardUnweighted && gpaCardWeighted){
          chrome.runtime.sendMessage({ type: 'print', data : "Better Canvas GPA card detected" }, (response) => {}); 
          gpaCardUnweighted.innerHTML = GPA
          gpaCardWeighted.innerHTML = GPA
        } else {
          setTimeout(injectGPA,100)
        }
      }      
      function findListHeader(){
        listHeader = document.querySelector("h2.css-tz46fa-view-heading div")
        if(listHeader){
          chrome.runtime.sendMessage({ type: 'print', data: "Injected List view" }, (response) => {}); 
          listHeader.innerHTML += ` ǀ GPA: ${GPA}`
          listHeader.style.fontWeight = "bold";


        }else{
          setTimeout(findListHeader, 100)
        }
      
      }
      findListHeader()
    function findActivityHeader(){
      activityHeader = document.querySelector("h2.recent-activity-header")
      if(activityHeader){
        chrome.runtime.sendMessage({ type: 'print', data: "Injected Recent Activity view" }, (response) => {}); 
        activityHeader.innerHTML += ` ǀ GPA: ${GPA}` 
        activityHeader.style.fontWeight = "bold";

      }else{
        setTimeout(findActivityHeader, 100)
      }

    }
    findActivityHeader()

    }else{
      
//       <div class="bettercanvas-gpa-card" style="display: inline-block;"><h3 class="bettercanvas-gpa-header">GPA</h3><div><p id="bettercanvas-gpa-unweighted">11</p>
// <table cellpadding="0" cellspacing="0" border="0" width="100%">
// <tbody><tr><td align="side">
// <img src="https://raw.githubusercontent.com/gavin-ho1/canvas-gpa-calculator/refs/heads/main/logo.png">
// </td></tr>
// </tbody></table>
// <p align="center">Canvas GPA Calculator</p></div></div>

      function findTitleSpan() {
        const titleSpan = document.querySelector("#dashboard_header_container > div > span > span:nth-child(1) > span > span");
        
        if (titleSpan) {
            chrome.runtime.sendMessage({ type: 'print', data: titleSpan.textContent }, (response) => {}); 
            titleSpan.innerHTML += " ǀ GPA: " + GPA;
        } else {
            // Retry after 100ms if the element is not found
            setTimeout(findTitleSpan, 100);
        }
    }
    
    // Start checking for the element
    findTitleSpan();
    }
      
      

    


  })
   
  
}else{

  hyperLink = document.querySelector("a.mobile-header-title.expandable")
  courseID = hyperLink.href.match(/\d+/)
  chrome.runtime.sendMessage({ type: 'print', data : "CourseID: " +courseID }, (response) => {});
    


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
     
      
// Improved wrapper function for async waits
async function ensureElementsExist(selector) {
  return new Promise((resolve) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
          resolve(elements);
      } else {
          const observer = new MutationObserver((mutations, obs) => {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                  obs.disconnect();
                  resolve(elements);
              }
          });
          observer.observe(document.body, { childList: true, subtree: true });
      }
  });
}

// Async main content execution to ensure sequence
(async () => {
  chrome.runtime.sendMessage({ type: 'print', data: "Starting content script" }, () => {});

  // Example function calls with async handling
  try {
      const gradedAssigmentGradeWrappers = await ensureElementsExist("td.assignment_score span.grade");
      console.log("Elements found:", gradedAssigmentGradeWrappers);

      gradedAssigmentGradeWrappers.forEach(span => {
          if (!span.innerHTML.includes("Instructor has not posted this grade")) {
              const num = span.innerHTML.trim().match(/\d+(\.\d+)?$/);
              if (num) {
                  gradeList.push(parseFloat(num[0]));
                  totalPointList.push(parseFloat(span.nextElementSibling.innerHTML.replace("/", "")));
              }
          }
      });

      // Continue with dependent operations
  } catch (error) {
      console.error("Error in element loading:", error);
  }

  // Additional async calls with await
  try {
      await injectCard();
      await injectGPA();
  } catch (error) {
      console.error("Error in injection functions:", error);
  }


      for(index in gradeList){
        if(gradeList[index] !== "--"){
          pointDict[categoriesList[index]] += gradeList[index]
          totalPointDict[categoriesList[index]] += totalPointList[index]
        }
      
      }
      var countedWeight = 0
      filteredKeys.forEach(category => {
        // chrome.runtime.sendMessage({ type: 'print', data : pointDict[category]/totalPointDict[category] }, (response) => {}); 
        if(totalPointDict[category] !== 0){ //Check for div by zero
          finalGradeDict[category] = pointDict[category]/totalPointDict[category]
          countedWeight += weightDict[category]
        }else{
          finalGradeDict[category] = "NaN"
        }
      
      })
    })();
      // chrome.runtime.sendMessage({ type: 'print', data : finalGradeDict }, (response) => {}); 
      
      var finalGrade = 0
      
      filteredKeys.forEach(category => {
        if(finalGradeDict[category] !== "NaN"){
          chrome.runtime.sendMessage({ type: 'print', data : finalGradeDict[category]*weightDict[category] }, (response) => {}); 
          finalGrade += finalGradeDict[category]*weightDict[category]
        }
        
      })
      
      chrome.runtime.sendMessage({ type: 'print', data : countedWeight }, (response) => {});

      finalGrade = (finalGrade/countedWeight)*100
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

  let letterGrade;

  //I'm not stupid, its just that js won't accept composite functions, which is why there is a lack of functions in this entire script
  if (finalGrade >= 97) {
    letterGrade = "A+";
  } else if (finalGrade >= 93) {
    letterGrade = "A";
  } else if (finalGrade >= 90) {
    letterGrade = "A-";
  } else if (finalGrade >= 87) {
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
