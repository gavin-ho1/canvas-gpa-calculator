// Save options function, including gradeRounding and courseDict
const saveOptions = () => {
    const active = document.getElementById('active').checked;
    const letterGrade = document.getElementById('letterGrade').checked;
    const showGPA = document.getElementById('showGPA').checked;
    const gpaScale = document.getElementById('gpaScale').checked;
    const gradeRounding = parseFloat(document.getElementById('gradeRoundingSlider').value);

    chrome.storage.sync.get(['courseRegistry', 'courseDict'], (items) => {
        const courseRegistry = items.courseRegistry || {};
        const courseDict = items.courseDict || {};

        chrome.storage.sync.set(
            { active, letterGrade, showGPA, gpaScale, gradeRounding, courseRegistry, courseDict },
            () => {
                console.log('Options saved:', { active, letterGrade, showGPA, gpaScale, gradeRounding, courseDict });
            }
        );
    });
};

// Restore options function, including gradeRounding and course list
const restoreOptions = () => {
    chrome.storage.sync.get(
        { active: true, letterGrade: true, showGPA: true, gpaScale: false, gradeRounding: 0, courseRegistry: {}, courseDict: {} },
        (items) => {
            document.getElementById('active').checked = items.active;
            document.getElementById('letterGrade').checked = items.letterGrade;
            document.getElementById('showGPA').checked = items.showGPA;
            document.getElementById('gpaScale').checked = items.gpaScale;
            document.getElementById('gradeRoundingSlider').value = items.gradeRounding;
            document.getElementById('gradeRoundingValue').innerText = items.gradeRounding.toFixed(2);

            displayCourseList(items.courseRegistry, items.courseDict, items.gradeRounding);
        }
    );
};

// Display course list with grade inputs and grade rounding logic
const displayCourseList = (courseRegistry, courseDict, gradeRounding) => {
    const courseRegistryContainer = document.getElementById('courseRegistryContainer');
    courseRegistryContainer.innerHTML = ''; // Clear previous entries

    // Calculate maximum width for course names for consistent layout
    const maxCourseNameLength = Math.max(...Object.values(courseRegistry).map(courseName => courseName.length));
    const maxWidth = `${maxCourseNameLength * 8}px`;

    for (const [courseKey, courseName] of Object.entries(courseRegistry)) {
        // Create container for each course
        const courseElement = document.createElement('div');
        courseElement.className = 'course-item';

        // Course name element
        const courseNameElement = document.createElement('span');
        courseNameElement.className = 'course-name';
        courseNameElement.innerText = `${courseName}: `;
        courseNameElement.style.width = maxWidth;
        courseElement.appendChild(courseNameElement);

        // Input for course grade
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.min = '0';
        inputElement.step = '0.01';
        inputElement.value = courseDict[courseKey]?.grade || '';
        inputElement.className = 'course-input';

        // Event listener to update courseDict on input change
        inputElement.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value) || 0;
            const roundedGrade = value + gradeRounding;
            const point = calculateGradePoint(roundedGrade);

            courseDict[courseKey] = { grade: value, gradePoint: point };

            // Update storage with new courseDict values
            chrome.storage.sync.set({ courseDict });
        });

        courseElement.appendChild(inputElement);
        courseRegistryContainer.appendChild(courseElement);
    }
};

// Calculate grade point based on rounded grade
const calculateGradePoint = (roundedGrade) => {
    if (roundedGrade >= 97) return 12;
    if (roundedGrade >= 93) return 11;
    if (roundedGrade >= 90) return 10;
    if (roundedGrade >= 87) return 9;
    if (roundedGrade >= 83) return 8;
    if (roundedGrade >= 80) return 7;
    if (roundedGrade >= 77) return 6;
    if (roundedGrade >= 73) return 5;
    if (roundedGrade >= 70) return 4;
    if (roundedGrade >= 67) return 3;
    if (roundedGrade >= 63) return 2;
    if (roundedGrade >= 60) return 1;
    return 0;
};

// Update displayed slider value and save options on slider change
document.getElementById('gradeRoundingSlider').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value).toFixed(2);
    document.getElementById('gradeRoundingValue').innerText = value;
    saveOptions();
});

// Set up event listeners for checkboxes
document.getElementById('active').addEventListener('click', saveOptions);
document.getElementById('letterGrade').addEventListener('click', saveOptions);
document.getElementById('showGPA').addEventListener('click', saveOptions);
document.getElementById('gpaScale').addEventListener('click', saveOptions);

// Restore options on page load
document.addEventListener('DOMContentLoaded', restoreOptions);
