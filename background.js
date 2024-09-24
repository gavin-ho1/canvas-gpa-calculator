//Run content.js on page load
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabURL = tabs[0].url;
    chrome.tabs.executeScript(tabs[0].id, { file: "content.js" });
  });
});

var url
var grade
var courseID

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getURL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      
      const activeTab = tabs[0];
      url = activeTab.url;    

      const regex = /courses\/(\d+)\/grades/; // Matches digits after "courses/"
      courseID = regex.exec(url)[1];

      sendResponse({ courseID });
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
            console.log(courseID, grade)
          
            chrome.storage.sync.set({ courseDict }, () => {
              // console.log(courseDict)
            });
            
          });
      }
  });

  }
});
