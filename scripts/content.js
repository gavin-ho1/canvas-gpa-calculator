

chrome.runtime.sendMessage({ type: 'print', data : "content.js is running" }, (response) => {});

chrome.storage.sync.get(
  { active : true, letterGrade : true, showGPA : true, gpaScale : false, gradeRounding : 0},
  (items) => {
    active = items.active
    letterGrades = items.letterGrade
    showGPA = items.showGPA
    gpaScale = items.gpaScale
    gradeRounding = items.gradeRounding



var courseID 

if(active){
  dashboardSpan = document.querySelector("span.mobile-header-title") //Detect for dashboard/homepage
  if(dashboardSpan){
    var maxLoop = 0
    function checkForCourseObjects(){
      const courseObjs = Array.from(document.querySelectorAll("a.ic-DashboardCard__link"));
      const courseNames = Array.from(document.querySelectorAll("h3 span"));

      var courseRegistry = {}

      chrome.runtime.sendMessage({ type: 'print', data: typeof courseObjs });
      maxLoop += 1
      if (Object.keys(courseObjs).length !== 0) {
        
        chrome.runtime.sendMessage({ type: 'print', data: "Course elements found" });
        chrome.runtime.sendMessage({ type: 'print', data: courseObjs });
         
        
        tempList = []
        courseObjs.forEach(course => {
          tempList.push(course.href+"/grades?grading_period_id=0") 
      });
      for (let step = 0; step < courseObjs.length; step++) {
        chrome.runtime.sendMessage({ type: 'print', data: tempList[step].match(/\d+/g)[0] });
        courseRegistry[tempList[step].match(/\d+/g)[0]] = courseNames[step]
      }

      chrome.runtime.sendMessage({ type: 'courseList', data: tempList});
      chrome.runtime.sendMessage({ type: 'courseRegistry', data: courseRegistry});
  
      } else {
        chrome.runtime.sendMessage({ type: 'print', data: "Course elements not found" });
        if(maxLoop < 10){
          setTimeout(() => {
            checkForCourseObjects();
          }, 1000);
        }
        
      } 
    } 
    
    checkForCourseObjects()
  
  
    chrome.runtime.sendMessage({ type: 'print', data : "dashboard page detected" }, (response) => {}); 
    if(showGPA === false){
      throw "GPA not shown";
    }
    var GPA = 0
    chrome.storage.sync.get('courseDict', (result) => {
      const courseDict = result.courseDict || {};
      chrome.runtime.sendMessage({ type: 'print', data : "courseDict:" });
  
      chrome.runtime.sendMessage({ type: 'print', data : courseDict });
        
      
      Object.keys(courseDict).forEach(key => {
        gradePoint = courseDict[key].gradePoint

        if(gpaScale === false){
          gradePoint /= 3
          gradePoint = Math.ceil(gradePoint)
        }
        // chrome.runtime.sendMessage({ type: 'print', data : GPA }, (response) => {})
        GPA += gradePoint
      })
      GPA /= Object.keys(courseDict).length
      chrome.runtime.sendMessage({ type: 'print', data : "GPA:" }, (response) => {});
      chrome.runtime.sendMessage({ type: 'print', data : GPA }, (response) => {});
      chrome.runtime.sendMessage({ type: 'print', data : typeof GPA }, (response) => {}); // GPA variable must be within chrome.storage.sync.get(), otherwise the variable doesn't get saved
      
      if(isNaN(GPA)){
        GPA = "No course grades saved"
      }else{
        GPA = parseFloat(GPA.toFixed(2))
      }
      
      
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
        }
      )
        const gradedAssigmentGradeWrappers = document.querySelectorAll("td.assignment_score span.grade")
        chrome.runtime.sendMessage({ type: 'print', data : gradedAssigmentGradeWrappers }, (response) => {}); 
        gradedAssigmentGradeWrappers.forEach(span => {
          // Modified regex to handle decimals (numbers with or without decimals)
          let num = span.innerHTML.trim().match(/(\d+(\.\d+)?)/);  // This will match integers or decimals
          chrome.runtime.sendMessage({ type: 'print', data : span.innerHTML.trim() }, (response) => {});
  
          if (num) {
            // If a grade with a decimal is detected, push it into gradeList
            gradeList.push(parseFloat(num[0].replace("%","")));
            chrome.runtime.sendMessage({ type: 'print', data : num }, (response) => {}); 
            totalPointList.push(parseFloat(span.nextElementSibling.innerHTML.replace("/","")));
          } else {
            // Handle cases where no grade is found
            gradeList.push("--");
            totalPointList.push("--");
          }
        });
        
        chrome.runtime.sendMessage({ type: 'print', data : gradeList }, (response) => {}); 
  
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
        finalGrade = parseFloat(finalGrade.toFixed(2))
        
        chrome.runtime.sendMessage({ type: 'print', data : finalGrade }, (response) => {}); 
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
        num = parseFloat(span.innerHTML.match(/(\d+(\.\d+)?)/)[0])
  
        chrome.runtime.sendMessage({ type: 'print', data : span.innerHTML.trim() }, (response) => {});
  
        points += num
        totalPoints += parseFloat(span.nextElementSibling.innerHTML.trim().match(/(\d+(\.\d+)?)/)[0])
        chrome.runtime.sendMessage({ type: 'print', data : num }, (response) => {});
        
      })
      finalGrade = (points/totalPoints)*100
      finalGrade = parseFloat(finalGrade.toFixed(2))
    }
  
    let letterGrade;
  
    //I'm not stupid, its just that js won't accept composite functions, which is why there is a lack of functions in this entire script

    let roundedGrade = finalGrade + gradeRounding
    

    if (roundedGrade >= 97) {
      letterGrade = "A+";
    } else if (roundedGrade >= 93) {
      letterGrade = "A";
    } else if (roundedGrade >= 90) {
      letterGrade = "A-";
    } else if (roundedGrade >= 87) {
      letterGrade = "B+";
    } else if (roundedGrade >= 83) {
      letterGrade = "B";
    } else if (roundedGrade >= 80) {
      letterGrade = "B-";
    } else if (roundedGrade >= 77) {
      letterGrade = "C+";
    } else if (roundedGrade >= 73) {
      letterGrade = "C";
    } else if (roundedGrade >= 70) {
      letterGrade = "C-";
    } else if (roundedGrade >= 67) {
      letterGrade = "D+";
    } else if (roundedGrade >= 63) {
      letterGrade = "D";
    } else if (roundedGrade >= 60) {
      letterGrade = "D-";
    } else if (finalGrade === NaN){
      letterGrade = "None"
    }else{
      letterGrade = "F";
    }
    
    chrome.runtime.sendMessage({ type: 'print', data : typeof finalGrade }, (response) => {});
    
    // Set up a mutation observer to monitor the loading of specific elements
  const observer = new MutationObserver((mutations, observerInstance) => {
    if (document.readyState === "complete") {
      // Once the document is fully loaded, check for the grading menu
      const gradingMenu = document.querySelector("span input#grading_period_select_menu");
      if (gradingMenu && gradingMenu.title.includes("All Grading Periods")) {
        chrome.runtime.sendMessage({ type: 'print', data: "All Grading Periods" });
        if (finalGrade !== "NaN"){
          chrome.runtime.sendMessage({ type: "getGrade", data: [finalGrade, courseID, letterGrade] });
        }
      }
  
      // Disconnect observer as it has finished its job after page load
      observerInstance.disconnect();
    }
  });
  
  // Observe the entire document for changes (necessary if elements are dynamically added post-load)
  observer.observe(document, { childList: true, subtree: true });
  
  // Optional: Disconnect observer after a timeout in case the page load is delayed
  setTimeout(() => observer.disconnect(), 5000); // Adjust timeout duration as needed
  
    
    
    
    
  
    
  
    chrome.runtime.sendMessage({ type: 'print', data : "Final Grade: "+finalGrade+"% ("+letterGrade+")"+"rounding: "+gradeRounding }, (response) => {}); 
  
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
  
    const displayAside = document.querySelector("#right-side #student-grades-right-content") 
    if(finalGrade === "NaN"){
      displayAside.innerHTML =   `<div class="student_assignment final_grade">
      Total:
        <span class="grade">No assigments graded</span>
          (<span class="letter_grade" id="final_letter_grade_text"></span>)
    </div>` + displayAside.innerHTML
    }else{
      if(letterGrades){
        displayAside.innerHTML =   `<div class="student_assignment final_grade">
        Total:
          <span class="grade">${finalGrade}%</span>
            (<span class="letter_grade" id="final_letter_grade_text">${letterGrade}</span>)
      </div>` + displayAside.innerHTML
    
      }else{
        displayAside.innerHTML =   `<div class="student_assignment final_grade">
        Total:
          <span class="grade">${finalGrade}%</span>
            <span class="letter_grade" id="final_letter_grade_text"></span>
      </div>` + displayAside.innerHTML 
      }
      
    }
  
  }
  
}
})
