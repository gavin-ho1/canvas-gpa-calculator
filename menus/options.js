// Save options function, updated to include gradeRounding
const saveOptions = () => {
    const active = document.getElementById('active').checked;
    const letterGrade = document.getElementById('letterGrade').checked;
    const showGPA = document.getElementById('showGPA').checked;
    const gpaScale = document.getElementById('gpaScale').checked;
    const gradeRounding = parseFloat(document.getElementById('gradeRoundingSlider').value);

    chrome.storage.sync.set(
        { active, letterGrade, showGPA, gpaScale, gradeRounding , courseRegistry},
        () => {
            console.log({ active, letterGrade, showGPA, gpaScale, gradeRounding });
        }
    );
};

// Restore options function, updated to restore gradeRounding slider
const restoreOptions = () => {
    chrome.storage.sync.get(
        { active: true, letterGrade: true, showGPA: true, gpaScale: false, gradeRounding: 0 , courseRegistry: {}},
        (items) => {
            document.getElementById('active').checked = items.active;
            document.getElementById('letterGrade').checked = items.letterGrade;
            document.getElementById('showGPA').checked = items.showGPA;
            document.getElementById('gpaScale').checked = items.gpaScale;
            document.getElementById('gradeRoundingSlider').value = items.gradeRounding;
            document.getElementById('gradeRoundingValue').innerText = items.gradeRounding.toFixed(2);
            
            // Clear previous entries
            const courseRegistryContainer = document.getElementById('courseRegistryContainer');
            courseRegistryContainer.innerHTML = ''; 

            // Calculate the maximum length of all course names
            const maxCourseNameLength = Math.max(
                ...Object.values(items.courseRegistry).map((courseName) => courseName.length)
            );

            // Set the width in pixels based on the longest course name (assuming average character width of 8px)
            const maxWidth = `${maxCourseNameLength * 8}px`;

            // Iterate over each key-value pair in courseRegistry and create elements
            for (const [courseKey, courseName] of Object.entries(items.courseRegistry)) {
                // Create a container for each course item
                const courseElement = document.createElement('div');
                courseElement.className = 'course-item';

                // Add course name
                const courseNameElement = document.createElement('span');
                courseNameElement.className = 'course-name';
                courseNameElement.innerText = `${courseName}: `;
                courseNameElement.style.width = maxWidth; // Set dynamic width
                courseElement.appendChild(courseNameElement);

                // Add numeric input for the course
                const inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.min = '0';
                inputElement.step = '0.01';
                inputElement.value = items.courseRegistry[courseKey] || '';
                inputElement.className = 'course-input';
                inputElement.addEventListener('input', (event) => {
                    const value = parseFloat(event.target.value) || 0;

                    // Update storage with new value
                    chrome.storage.sync.get({ courseDict: {} }, (data) => {
                        data.courseDict[courseKey] = value;
                        chrome.storage.sync.set({ courseDict: data.courseDict });
                    });
                });

                // Append the input element next to the course name
                courseElement.appendChild(inputElement);

                // Append the course element to the container
                courseRegistryContainer.appendChild(courseElement);
            }
        }
    );
};


// Update displayed slider value and save options on slider change
document.getElementById('gradeRoundingSlider').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value).toFixed(2);
    document.getElementById('gradeRoundingValue').innerText = value;
    saveOptions();
});

// Set up event listeners for other settings
document.getElementById('active').addEventListener('click', saveOptions);
document.getElementById('letterGrade').addEventListener('click', saveOptions);
document.getElementById('showGPA').addEventListener('click', saveOptions);
document.getElementById('gpaScale').addEventListener('click', saveOptions);

document.addEventListener('DOMContentLoaded', restoreOptions);
