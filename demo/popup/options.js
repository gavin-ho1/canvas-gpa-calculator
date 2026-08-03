// Save options function, including gradeRounding and courseDict
const saveOptions = () => {
    const active = document.getElementById('active').checked;
    const letterGrade = document.getElementById('letterGrade').checked;
    const showGPA = document.getElementById('showGPA').checked;
    const gpaScale = document.getElementById('gpaScale').checked;
    const gradeRounding = parseFloat(document.getElementById('gradeRoundingSlider').value);

    browser.storage.sync.get(['courseRegistry', 'courseDict']).then((items) => {
        const courseRegistry = items.courseRegistry || {};
        const courseDict = items.courseDict || {};

        browser.storage.sync.set(
            { active, letterGrade, showGPA, gpaScale, gradeRounding, courseRegistry, courseDict }
        ).then(() => {
            console.log('Options saved:', { active, letterGrade, showGPA, gpaScale, gradeRounding, courseDict });
        });
    });
};

// Restore options function, including gradeRounding and course list
const restoreOptions = () => {
    browser.storage.sync.get(
        { active: true, letterGrade: true, showGPA: true, gpaScale: false, gradeRounding: 0, courseRegistry: {}, courseDict: {} }
    ).then((items) => {
        document.getElementById('active').checked = items.active;
        document.getElementById('letterGrade').checked = items.letterGrade;
        document.getElementById('showGPA').checked = items.showGPA;
        document.getElementById('gpaScale').checked = items.gpaScale;
        document.getElementById('gradeRoundingSlider').value = items.gradeRounding;
        document.getElementById('gradeRoundingValue').innerText = items.gradeRounding.toFixed(2);

        displayCourseList(items.courseRegistry, items.courseDict, items.gradeRounding);
    });
};

// Display course list with grade inputs and grade rounding logic
const displayCourseList = (courseRegistry, courseDict, gradeRounding) => {
    const courseRegistryContainer = document.getElementById('courseRegistryContainer');
    courseRegistryContainer.innerHTML = ''; // Clear previous entries

    const entries = Object.entries(courseRegistry);

    if (entries.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-tracked-courses';
        emptyMessage.innerHTML = 'No courses are being tracked currently.<br>Go to the dashboard page to track them.';
        courseRegistryContainer.appendChild(emptyMessage);
        return;
    }

    for (const [courseKey, courseName] of Object.entries(courseRegistry)) {
        // Create container for each course
        const courseElement = document.createElement('div');
        courseElement.className = 'course-item';
        courseElement.style.display = 'flex';
        courseElement.style.alignItems = 'center';
        courseElement.style.marginBottom = '8px';

        // Checkbox for including in GPA
        const checkboxElement = document.createElement('input');
        checkboxElement.type = 'checkbox';
        checkboxElement.checked = courseDict[courseKey]?.included !== false;
        checkboxElement.style.marginRight = '8px';
        checkboxElement.addEventListener('change', () => {
            if (!courseDict[courseKey]) {
                courseDict[courseKey] = { grade: 0, gradePoint: 0 };
            }
            courseDict[courseKey].included = checkboxElement.checked;
            browser.storage.sync.set({ courseDict });
        });
        courseElement.appendChild(checkboxElement);

        // Course name element
        const courseNameElement = document.createElement('span');
        courseNameElement.className = 'course-name';
        courseNameElement.innerText = `${courseName}: `;
        courseElement.appendChild(courseNameElement);

        // Input for course grade
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.min = '0';
        inputElement.step = '0.01';
        inputElement.value = courseDict[courseKey]?.grade || '';
        inputElement.className = 'course-input';
        inputElement.style.width = '60px';

        // Event listener to update courseDict on input change
        inputElement.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value) || 0;
            const roundedGrade = value + gradeRounding;
            const point = calculateGradePoint(roundedGrade);

            if (!courseDict[courseKey]) {
                courseDict[courseKey] = { included: true };
            }
            courseDict[courseKey].grade = value;
            courseDict[courseKey].gradePoint = point;

            // Update storage with new courseDict values
            browser.storage.sync.set({ courseDict });
        });

        // Create and style the '%' label
        const percentLabel = document.createElement('span');
        percentLabel.className = 'percent-label';
        percentLabel.innerText = '%';
        percentLabel.style.marginLeft = '4px';

        // Append input and '%' sign to course element
        courseElement.appendChild(inputElement);
        courseElement.appendChild(percentLabel);

        // Append the course element to the container
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

document.getElementById("link").addEventListener('click', function() {
    browser.tabs.create({ url: "https://github.com/gavin-ho1/canvas-gpa-calculator/tree/main" });
});
document.getElementById("chrome-review-link").addEventListener('click', function() {
    browser.tabs.create({ url: "https://chromewebstore.google.com/detail/canvas-gpa-calculator/hedjldnoldbeihmghalfbkaobifigmhi/reviews" });
});

document.getElementById("edge-review-link").addEventListener('click', function() {
    browser.tabs.create({ url: "https://microsoftedge.microsoft.com/addons/detail/canvas-gpa-calculator/kjljmlkojppfklkhdifcbbkhbalhmgfm" });
});

// Clear Course Info button
document.getElementById('clear').addEventListener('click', async () => {
    const button = document.getElementById('clear');
    await browser.storage.sync.remove(['courseRegistry', 'courseDict', 'courseLinks']);
    button.innerText = 'Cleared';
    setTimeout(() => {
        button.innerText = 'Clear Course Info';
    }, 2000);
    restoreOptions();
});

// Live refresh when storage changes (e.g., background tab finishes fetching)
browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && (changes.courseRegistry || changes.courseDict)) {
        browser.storage.sync.get({
            active: true,
            letterGrade: true,
            showGPA: true,
            gpaScale: false,
            gradeRounding: 0,
            courseRegistry: {},
            courseDict: {}
        }).then((items) => {
            displayCourseList(items.courseRegistry, items.courseDict, items.gradeRounding);
        });
    }
});
