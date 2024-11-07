console.log(chrome);  

const saveOptions = () => {
    const active = document.getElementById('active').checked;
    const letterGrade = document.getElementById('letterGrade').checked
    const showGPA = document.getElementById('showGPA').checked
    chrome.storage.sync.set(
        { active, letterGrade, showGPA },
        () => {
            console.log({ active: active, letterGrade: letterGrade, showGPA : showGPA}) 
        })
    
}

const restoreOptions = () => {
    chrome.storage.sync.get(
      { active : true, letterGrade : true, showGPA : true },
      (items) => {
        document.getElementById('active').checked = items.active
        document.getElementById('letterGrade').checked = items.letterGrade
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
  
  document.getElementById('active').addEventListener('click', saveOptions);
  document.getElementById('letterGrade').addEventListener('click', saveOptions);
  document.getElementById('showGPA').addEventListener('click', saveOptions);
