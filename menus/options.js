document.addEventListener('DOMContentLoaded', function () {
    // Load settings from chrome.storage.sync
    // chrome.storage.sync.get("settings", (result) => {
    //   // If no settings exist, use default values
    //   const settings = result.settings || {
    //     active: true,
    //     letterGrades: true,
    //     showGPA: true,
    //   };
  
      // Initialize toggle buttons with the settings
      document.querySelectorAll('.toggleContainer').forEach(container => {
        const switchElement = container.querySelector('.switch');
        const labelElement = container.querySelector('.toggleLabel');
        
        const toggleId = container.getAttribute('data-id');  // "active", "letterGrades", "showGPA"
        
        // Set initial state of the switch
        const isOn = settings[toggleId];  // Get the corresponding setting
        switchElement.classList.toggle('on', isOn);  // Apply the initial state
        labelElement.textContent = isOn ? 'On' : 'Off';  // Update the label text
  
        // Add click event listener to toggle the switch
        switchElement.addEventListener('click', () => {
          // Toggle the "on" class and update label text
          const newState = !switchElement.classList.contains('on');
          switchElement.classList.toggle('on', newState);
          labelElement.textContent = newState ? 'On' : 'Off';
          
          // Update the setting and save it
          settings[toggleId] = newState;
          chrome.storage.sync.set({ settings: settings }, () => {
            console.log(`Setting for ${toggleId} updated.`);
          });
        });
      });
    });
//   });
  