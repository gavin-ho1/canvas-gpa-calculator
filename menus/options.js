// Load settings from chrome.storage.sync
chrome.storage.sync.get("settings", (result) => {
    const settings = result.settings || {
      active: true,
      letterGrades: true,
      showGPA: true,
    };
  
    // Now that settings are loaded, we can initialize the toggle buttons
    document.querySelectorAll('.toggleContainer').forEach(container => {
      // Get the switch and label within each container
      const switchElement = container.querySelector('.switch');
      const labelElement = container.querySelector('.toggleLabel');
      
      // Set the initial state of the switch based on settings
      const toggleId = container.getAttribute('data-id');
      const isOn = settings[toggleId];  // Use the corresponding setting
      switchElement.classList.toggle('on', isOn);  // Set initial state
      labelElement.textContent = isOn ? 'On' : 'Off';
  
      // Add click event listener to toggle the switch
      switchElement.addEventListener('click', () => {
        const newState = !switchElement.classList.contains('on');
        switchElement.classList.toggle('on', newState);
        labelElement.textContent = newState ? 'On' : 'Off';
  
        // Update the settings object and save it
        settings[toggleId] = newState;
        chrome.storage.sync.set({ settings: settings }, () => {
          console.log("Settings updated and saved.");
        });
      });
    });
  });
  