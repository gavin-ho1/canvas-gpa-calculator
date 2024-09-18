// Find the target <aside> element with the ID "right-side-wrapper"
const asideElement = document.getElementById('right-side');

if (asideElement) {
    // Create a new div element
    const newDiv = document.createElement('div');

    // Add some content to the new div with the custom font size
    newDiv.innerHTML = `
        <div style="font-size: 1.2em; background-color: lightblue;">
            <p>This div was injected at the top of <aside id="right-side-wrapper"></p>
        </div>
    `;

    // Insert the new div as the first child of the <aside> element
    asideElement.insertAdjacentElement('afterbegin', newDiv);
}
