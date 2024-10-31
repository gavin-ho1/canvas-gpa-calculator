console.log("background.js running")
console.log(courseDict)


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.action === "autoLoad"){
    chrome.storage.sync.get(["links"], function(result) {
      const urls = result.links[1] || [];
      
      // Loop through the URLs and open each one in a new tab
      urls.forEach(url => {
          chrome.tabs.create({ url });
      });
    });
  }
})


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
      grade = request.data[0]
      courseID = request.data[1]
      gradePoint = gradeDict[request.data[2]]
      console.log(gradePoint)
      
      chrome.storage.sync.get('courseDict', (result) => {
        const courseDict = result.courseDict || {timeGraph : {}}; // Initialize if not present
        const date = new Date();

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        // This arrangement can be altered based on how we want the date's format to appear.
        let currentDate = `${day}-${month}-${year}`;
        
        timeGraph = courseDict.timeGraph
        
        timeGraph[currentDate] = grade

        courseDict[courseID] = {
          grade: grade,
          gradePoint : gradePoint,
          timeGraph : timeGraph
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
    if(request.description !== undefined){
      console.log(request.description, request.data)
    }else{
      console.log(request.data)
    }
    
  }
})