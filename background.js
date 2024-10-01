console.log("background.js running")

var tabURL
var grade
var courseID

//Listen for getGrade
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  //Get grade of current page
  if (request.type === 'getGrade') {
      grade = request.data
      
      chrome.storage.sync.get('courseDict', (result) => {
        const courseDict = result.courseDict || {}; // Initialize if not present
        courseDict[courseID] = {
          data: grade
        };
        console.log("Grade:", grade)
        console.log("Course ID:", courseID)
        // For debugging
        chrome.storage.sync.set({ courseDict }, () => {
          console.log("Course Dictonary:",courseDict)
          // For Debuging
        });
        
      });
  }
});

//Listen for getURL
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'getID') {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       tabURL = tabs[0].url;

//       const regex = /courses\/(\d+)\/grades/; // Matches digits after "courses/"
//       courseID = regex.exec(tabURL)[1];
      
//       console.log("Tab URL:", tabURL)
//       console.log("Pulled course ID:", courseID)
//     });
    
//   }
// });

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