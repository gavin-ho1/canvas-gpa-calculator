console.log("background.js running")





var tabURL
var grade
var courseID
gradeDict ={
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

//Listen for getGrade
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  //Get grade of current page
  if (request.type === 'getGrade') {
    const grade = request.data[0];
    const courseID = request.data[1];
    const gradePoint = gradeDict[request.data[2]];
    const currentDate = new Date().toISOString().split('T')[0];
  
    chrome.storage.sync.get('courseDict', (result) => {
      const courseDict = result.courseDict || {};
      courseDict[courseID] = courseDict[courseID] || {}; // Ensure course exists
      
      // Add a date-specific entry for tracking grade updates
      courseDict[courseID][currentDate] = {
        grade: grade,
        gradePoint: gradePoint,
      };
  
      chrome.storage.sync.set({ courseDict }, () => {
        console.log("Updated Course Dictionary:", courseDict);
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