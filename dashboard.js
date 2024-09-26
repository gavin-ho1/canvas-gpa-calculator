chrome.runtime.sendMessage({ type: 'getCourseDict' }, (response) => {
    courseDict = response;
    var total
    keyList = courseDict.keys()
    // for each
  }); 