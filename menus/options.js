console.log(chrome.storage);  

function saveOptions() {
    const active = document.getElementById('active').checked;
    const letterGrade = document.getElementById('letterGrade').checked;
    const showGPA = document.getElementById('showGPA').checked;
  
    // Send message to background script with options data
    chrome.runtime.sendMessage({
      action: 'saveOptions',
      data: { active, letterGrade, showGPA },
    });
  }

  function restoreOptions() {
    // Send a message to the background script to fetch options
    chrome.runtime.sendMessage({ action: 'restoreOptions' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        document.getElementById('active').checked = response.active;
        document.getElementById('letterGrade').checked = response.letterGrade;
        document.getElementById('showGPA').checked = response.showGPA;
      }
    });
  }
  

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
