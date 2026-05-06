if (typeof importScripts !== 'undefined') {
  importScripts('browser-polyfill.min.js');
}

console.log("background.js running")

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.tabs.create({ url: browser.runtime.getURL('menus/install.html') });
  }
});

var tabURL
var grade
var courseID
var gradeDict

browser.storage.sync.get('gradeDict').then((result) => {
  gradeDict = result.gradeDict || {
    "A+": 12,
    "A": 11,
    "A-": 10,
    "B+": 9,
    "B": 8,
    "B-": 7,
    "C+": 6,
    "C": 5,
    "C-": 4,
    "D+": 3,
    "D": 2,
    "D-": 1,
    "F": 0
  }
  browser.storage.sync.set({ gradeDict: gradeDict });
});

//Listen for getGrade
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //Get grade of current page
  if(request.type === "courseRegistry"){
    const courseRegistry = request.data
    console.log("courseRegistry:", courseRegistry);
    browser.storage.sync.set({ courseRegistry: courseRegistry }).then(() => {
      console.log("Course links have been stored.");
    });
    return Promise.resolve({ status: "success" });
  }

  if(request.type === "courseList"){
    const tempList = request.data
    console.log("tempList:", tempList);
    browser.storage.sync.set({ courseLinks: tempList }).then(() => {
      console.log("Course links have been stored.");
    });
    return Promise.resolve({ status: "success" });
  }

  if (request.type === 'getGrade') {
    grade = request.data[0]
    courseID = request.data[1]
    const gradePoint = gradeDict[request.data[2]]
    console.log("Grade:", grade, "GradePoint:", gradePoint)

    const currentDate = new Date().toISOString().split('T')[0];
    console.log(currentDate)
    
    browser.storage.sync.get('courseDict').then((result) => {
      const courseDict = result.courseDict || {}; // Initialize if not present

      courseDict[courseID] = {
        grade: grade,
        gradePoint : gradePoint
      };

      console.log("Grade:", grade)
      console.log("Course Dictonary:",courseDict)
      browser.storage.sync.set({ courseDict }).then(() => {
        console.log("Course Dictonary saved:",courseDict)
      });
    });
  }

  if (request.type === 'getCourseDict') {
    browser.storage.sync.get('courseDict').then((result) => {
      const courseDict = result.courseDict || {}; 
      console.log("Requested courseDict:",courseDict)
    });
  }

  if(request.type === "print"){
    if(request.description !== undefined){
      console.log(request.description, request.data)
    }else{
      console.log(request.data)
    }
  }
});