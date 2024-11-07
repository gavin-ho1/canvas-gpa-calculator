const saveOptions = () => {
    const active = document.getElementById('active').checked;
    const letterGrades = document.getElementById('letterGraders').checked
    const showGPA = document.getElementById('showGPA').checked
    chrome.storage.sync.set(
        { active, letterGrades, showGPA },
        () => {
            console.log({ active: active, letterGrades: letterGrades, showGPA : showGPA}) 
        })
    
}

const restoreOptions = () => {
    chrome.storage.sync.get(
      { active : true, letterGrades : true, showGPA : true },
      (items) => {
        document.getElementById('active').checked = items.active
        document.getElementById('letterGraders').checked = items.letterGrades
        document.getElementById('showGPA').checked = items.showGPA
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

  document.querySelectorAll('input').addEventListener('click', saveOptions);
