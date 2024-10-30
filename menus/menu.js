
document.addEventListener('DOMContentLoaded', () => {
const openUrlButton = document.getElementById("openUrlButton");

        openUrlButton.addEventListener("click", () => {
            chrome.storage.sync.get(["links"], function(result) {
            const urls = result.links[1] || [];
            
            // Loop through the URLs and open each one in a new tab
            urls.forEach(url => {
                chrome.runtime.sendMessage({ type: 'print', data : url }, (response) => {});
                chrome.tabs.create({ url : url});
            });
        });

        });

        function clearData(){
            chrome.storage.sync.clear(() => {});
        document.querySelector("p.output").textContent = "Cleared!"
        }
    })