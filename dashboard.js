chrome.runtime.sendMessage({ type: 'getCourseDict' }, (response) => {
    courseDict = response;
  }); 