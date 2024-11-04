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
  if(request.type === "courseList"){
    const courseObjs = Array.from(request.data)
    console.log("courseObjs:", courseObjs);
    console.log(typeof courseObjs)


    tempList = []
    courseObjs.forEach(course => {
  //     console.log(course.href); // Log the course element
  });

    console.log(tempList)
    chrome.storage.sync.set({ "courseLink" : tempList})
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