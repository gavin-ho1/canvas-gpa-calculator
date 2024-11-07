
const saveOptions = () => {
    const active = document.getElementById('active').checked;
    const letterGrade = document.getElementById('letterGrade').checked
    const showGPA = document.getElementById('showGPA').checked
    const gpaScale = document.getElementById('gpaScale').checked

    if(gpaScale){
        gradeDict = {
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
      }else{
        gradeDict = {
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
      }

    chrome.storage.sync.set(
        { active, letterGrade, showGPA, gpaScale, gradeDict},
        () => {
            console.log({ active: active, letterGrade: letterGrade, showGPA : showGPA, gpaScale : gpaScale}) 
        })
    
}

const restoreOptions = () => {
    chrome.storage.sync.get(
      { active : true, letterGrade : true, showGPA : true, gpaScale : false},
      (items) => {
        document.getElementById('active').checked = items.active
        document.getElementById('letterGrade').checked = items.letterGrade
        document.getElementById('showGPA').checked = items.showGPA
        document.getElementById('gpaScale').checked = items.gpaScale
        
      }
    )}  

document.querySelectorAll('.toggleContainer').forEach(container => {
    // Get the switch and label within each container
    const switchElement = container.querySelector('.switch');
    const labelElement = container.querySelector('.toggleLabel');
    
    // Add click event listener to toggle the switch
    switchElement.addEventListener('click', () => {
      // Toggle the "on" class on the switch

       
      switchElement.classList.toggle('on');
      
      // Update the label text based on the toggle state
    });
  });
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  
  document.getElementById('active').addEventListener('click', saveOptions);
  document.getElementById('letterGrade').addEventListener('click', saveOptions);
  document.getElementById('showGPA').addEventListener('click', saveOptions);
  document.getElementById('gpaScale').addEventListener('click', saveOptions);
