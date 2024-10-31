
document.addEventListener('DOMContentLoaded', () => {
const openUrlButton = document.getElementById("openUrlButton");
openUrlButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'autoLoad' });
  });
})