document.getElementById('link').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/gavin-ho1/canvas-gpa-calculator" });
});