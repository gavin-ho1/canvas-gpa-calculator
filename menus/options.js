// Select all toggle containers


if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get("settings", (result) => {
        const settings = result.settings || {
            active : true,
            letterGrades : true,
            showGPA : true
        }
        chrome.storage.sync.set(settings, function() {
            return settings
        });
        
    });
}else{
    console.error('Chrome storage is not available.');
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
  
