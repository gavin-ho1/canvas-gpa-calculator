// Function to load saved states from Chrome storage on page load
function loadToggleStates() {
    document.querySelectorAll('.toggleContainer').forEach(container => {
      const toggleId = container.getAttribute('data-id');
      const switchElement = container.querySelector('.switch');
      const labelElement = container.querySelector('.toggleLabel');
  
      // Retrieve each toggle's state from Chrome storage
      chrome.storage.sync.get([toggleId], (result) => {
        const isOn = result[toggleId];
        
        // Apply the saved state to each toggle
        if (isOn) {
          switchElement.classList.add('on');
          labelElement.textContent = 'On';
        } else {
          switchElement.classList.remove('on');
          labelElement.textContent = 'Off';
        }
      });
  
      // Add event listener to toggle switch and save state on click
      switchElement.addEventListener('click', () => {
        const isOn = !switchElement.classList.contains('on'); // Determine new state
        
        // Toggle the class and update label
        switchElement.classList.toggle('on');
        labelElement.textContent = isOn ? 'On' : 'Off';
  
        // Save the state in Chrome storage
        chrome.storage.sync.set({ [toggleId]: isOn });
      });
    });
  }
  
  // Load the toggle states when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', loadToggleStates);
  