var tabURL
var grade
var courseID

//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    url = tabs[0].url;
    
    if(url.includes("grades")){
      console.log("running content.js")
      chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
      
    }else {
      console.log("running dashboard.js") 
      chrome.tabs.executeScript(tabs[0].id, { file: "dashboard.js" });
      
    }
    console.log(url)
  });
});

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getURL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      tabURL = tabs[0].url;

      const regex = /courses\/(\d+)\/grades/; // Matches digits after "courses/"
      courseID = regex.exec(tabURL)[1];
      
      console.log("Tab URL:", tabURL)
      console.log("Pulled course ID:", courseID)

      sendResponse({ tabURL });
    });
    
  }
});
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