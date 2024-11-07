console.log("background.js running")


chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('menus/install.html') });
});


var tabURL
var grade
var courseID

var gradeDict


chrome.storage.sync.get('gradeDict', (result) => {
gradeDict = result.gradeDict || {
  "A+": 4,
    "A": 4,
    "A-": 4,
    "B+": 3,
    "B": 3,
    "B-": 3,
    "C+": 2,
    "C": 2,
    "C-": 2,
    "D+": 1,
    "D": 1,
    "D-": 1,
    "F": 0
  }
  chrome.storage.sync.set({ gradeDict: gradeDict }, () => {});
});

//Listen for getGrade
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //Get grade of current page
  if(request.type === "courseList"){
    const tempList = request.data
    console.log("tempList:", tempList);
    chrome.storage.sync.set({ courseLinks: tempList }, () => {
      console.log("Course links have been stored.");
      sendResponse({ status: "success" }); // Optional: send a response
    });

  }
  if (request.type === 'getGrade') {
      grade = request.data[0]
      courseID = request.data[1]
      gradePoint = gradeDict[request.data[2]]
      console.log("Grade:", grade, "GradePoint:", gradePoint)

      const currentDate = new Date().toISOString().split('T')[0];

      console.log(currentDate)
      
      
      chrome.storage.sync.get('courseDict', (result) => {
        const courseDict = result.courseDict || {}; // Initialize if not present

        courseDict[courseID] = {
          grade: grade,
          gradePoint : gradePoint
        };

        console.log("Grade:", grade)
        // For debugging
        console.log("Course Dictonary:",courseDict)
        chrome.storage.sync.set({ courseDict }, () => {
          console.log("Course Dictonary:",courseDict)
          // For Debuging
        });
        
      });
  }
});


//Listen for getCourseDict
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { 
  if (request.type === 'getCourseDict') {
    chrome.storage.sync.get('courseDict', (result) => {
      const courseDict = result.courseDict || {}; // Initialize if not present
      
      console.log("Requested courseDict:",courseDict)
      // For debugging
      
    });
}
});

//Debug Print
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.type === "print"){
    if(request.description !== undefined){
      console.log(request.description, request.data)
    }else{
      console.log(request.data)
    }
    
  }
})