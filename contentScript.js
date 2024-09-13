// Get the element with class 'grade' and extract the text (number 4)
const gradeElement = document.querySelector('.grade');

// Make sure the element exists on the page
if (gradeElement) {
    const gradeValue = gradeElement.childNodes[0].nodeValue.trim();

    // Send the extracted value to the background script
    chrome.runtime.sendMessage({ grade: gradeValue });
}