chrome.runtime.sendMessage({ type: 'getCourseDict' }, (response) => {
    courseDict = response;
    var total = 0
    var letterGrade
    gradeList = Object.entries(courseDict)
    chrome.runtime.sendMessage({ type: "print", data: gradeList  }, (response) => {}); 
    gradeList.forEach(function(numberGrade){
        if (numberGrade >= 97) {
            letterGrade = 'A+';
            total += 12
          } else if (numberGrade >= 93) {
            letterGrade = 'A';
            total += 11
          } else if (numberGrade >= 90) {
            letterGrade = 'A-';
            total += 10
          } else if (numberGrade >= 87) {
            letterGrade = 'B+';
            total += 9
          } else if (numberGrade >= 83) {
            letterGrade = 'B';
            total += 8
          } else if (numberGrade >= 80) {
            letterGrade = 'B-';
            total += 7
          } else if (numberGrade >= 77) {
            letterGrade = 'C+';
            total += 6
          } else if (numberGrade >= 73) {
            letterGrade = 'C';
            total += 5
          } else if (numberGrade >= 70) {
            letterGrade = 'C-';
            total += 4
          } else if (numberGrade >= 67) {
            letterGrade = 'D+';
            total += 3
          } else if (numberGrade >= 63) {
            letterGrade = 'D';
            total += 2
          } else if (numberGrade >= 60) {
            letterGrade = 'D-';
            total += 1
          } else {
            letterGrade = 'F';
          }
          
    })
    output = total/gradeList.length
    chrome.runtime.sendMessage({ type: "print", data: output  }, (response) => {});
  }); 