// Listen for the scraped value and display it in the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    document.getElementById('result').innerText = message.grade;
});
