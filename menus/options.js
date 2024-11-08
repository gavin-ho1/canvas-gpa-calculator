// Save options function, updated to include gradeRounding
const saveOptions = () => {
    const active = document.getElementById('active').checked;
    const letterGrade = document.getElementById('letterGrade').checked;
    const showGPA = document.getElementById('showGPA').checked;
    const gpaScale = document.getElementById('gpaScale').checked;
    const gradeRounding = parseFloat(document.getElementById('gradeRoundingSlider').value);

    chrome.storage.sync.set(
        { active, letterGrade, showGPA, gpaScale, gradeRounding },
        () => {
            console.log({ active, letterGrade, showGPA, gpaScale, gradeRounding });
        }
    );
};

// Restore options function, updated to restore gradeRounding slider
const restoreOptions = () => {
    chrome.storage.sync.get(
        { active: true, letterGrade: true, showGPA: true, gpaScale: false, gradeRounding: 0 },
        (items) => {
            document.getElementById('active').checked = items.active;
            document.getElementById('letterGrade').checked = items.letterGrade;
            document.getElementById('showGPA').checked = items.showGPA;
            document.getElementById('gpaScale').checked = items.gpaScale;
            document.getElementById('gradeRoundingSlider').value = items.gradeRounding;
            document.getElementById('gradeRoundingValue').innerText = items.gradeRounding.toFixed(2);
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
