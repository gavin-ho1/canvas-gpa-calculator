// Find the target element with the ID "student-grades-right-content"
const targetElement = document.getElementById('student-grades-right-content');

if (targetElement) {
    // Create a new div element
    const newDiv = document.createElement('div');

    // Add some content to the new div
    newDiv.innerHTML = `
        <div style="border: 1px solid black; padding: 20px; margin: 10px; background-color: lightgreen;">
            <h2>Injected HTML Content</h2>
            <p>This div was injected before #student-grades-right-content.</p>
        </div>
    `;

    // Insert the new div before the target element
    targetElement.parentNode.insertBefore(newDiv, targetElement);
}
