
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

  document.getElementById('link').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/gavin-ho1/canvas-gpa-calculator" });
});

document.getElementById('openUrlButton').addEventListener('click', () => {
    chrome.storage.sync.get('courseLinks', (result) => {
      const urls = result.courseLinks;
  
      if (Array.isArray(urls) && urls.length > 0) {
        let tabsLoaded = 0;
  
        urls.forEach(url => {
          // Open the URL in a new tab (not active)
          chrome.tabs.create({ url: url, active: false }, (tab) => {
            console.log("Opened tab:", tab.id);
  
            // Function to check if the document is fully loaded
            function checkDocumentLoaded() {
              return new Promise((resolve) => {
                const interval = setInterval(() => {
                  if (document.readyState === 'complete') {
                    clearInterval(interval);
                    resolve();
                  }
                }, 100); // Check every 100ms
              });
            }
  
            // Inject the polling script to check if the document is fully loaded
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: checkDocumentLoaded,
            }).then(() => {
              console.log("Document fully loaded for tab:", tab.id);
  
              // Close the tab immediately after loading completes
              chrome.tabs.remove(tab.id, () => {
                if (chrome.runtime.lastError) {
                  console.error("Error closing tab:", chrome.runtime.lastError.message);
                } else {
                  console.log(`Tab with ID ${tab.id} has been closed.`);
  
                  // Increment the count of loaded tabs
                  tabsLoaded++;
  
                  // If all tabs are loaded and closed, log completion
                  if (tabsLoaded === urls.length) {
                    console.log("All tabs have been loaded and closed.");
                  }
                }
              });
            }).catch(error => {
              console.error("Error injecting script:", error);
            });
          });
        });
      } else {
        console.warn("No URLs found or courseLinks is not an array.");
      }
    });
  });
  

  document.getElementById('clear').addEventListener('click', () => {
    chrome.storage.sync.clear(() => {
      if (chrome.runtime.lastError) {
        console.error("Error clearing local storage:", chrome.runtime.lastError.message);
      } else {
        document.getElementById('clear').innerText = "Cleared!"
        console.log("Local storage cleared successfully.");
      }
    });  
  });