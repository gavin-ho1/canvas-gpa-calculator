console.log("background.js running")

var tabURL
var grade
var courseID

//Listen for getGrade
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  //Get grade of current page
  if (request.type === 'getGrade') {
      grade = request.data[0]
      courseID = request.data[1]
      
      chrome.storage.sync.get('courseDict', (result) => {
        const courseDict = result.courseDict || {}; // Initialize if not present
        courseDict[courseID] = {
          data: grade
        };
        console.log("Grade:", grade)
        // For debugging
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
    console.log("Debug print:", request.data)
  }
})