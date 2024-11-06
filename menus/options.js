// Select all toggle containers


chrome.runtime.sendMessage({type : 'getSettings'}, (response) => {
    settings = response.settings
    document.querySelector("p").innerText = settings
    // Rest of your code...
});




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
  
