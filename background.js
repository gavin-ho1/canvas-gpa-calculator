chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Scraped grade value:", message.grade);  // Logs the number "4" to the console
});
