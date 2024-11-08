const saveOptions = () => {
    const active = document.getElementById('active').checked;
    const letterGrade = document.getElementById('letterGrade').checked;
    const showGPA = document.getElementById('showGPA').checked;
    const gpaScale = document.getElementById('gpaScale').checked;
    const gradeRounding = parseFloat(document.getElementById('gradeRounding').value);

    const gradeDict = gpaScale ? {
        "A+": 12, "A": 11, "A-": 10, "B+": 9, "B": 8, "B-": 7, "C+": 6,
        "C": 5, "C-": 4, "D+": 3, "D": 2, "D-": 1, "F": 0
    } : {
        "A+": 4, "A": 4, "A-": 4, "B+": 3, "B": 3, "B-": 3, "C+": 2,
        "C": 2, "C-": 2, "D+": 1, "D": 1, "D-": 1, "F": 0
    };

    chrome.storage.sync.set(
        { active, letterGrade, showGPA, gpaScale, gradeRounding, gradeDict },
        () => console.log({ active, letterGrade, showGPA, gpaScale, gradeRounding })
    );
};

const restoreOptions = () => {
    chrome.storage.sync.get(
        { active: true, letterGrade: true, showGPA: true, gpaScale: false, gradeRounding: 0 },
        (items) => {
            document.getElementById('active').checked = items.active;
            document.getElementById('letterGrade').checked = items.letterGrade;
            document.getElementById('showGPA').checked = items.showGPA;
            document.getElementById('gpaScale').checked = items.gpaScale;
            document.getElementById('gradeRounding').value = items.gradeRounding;
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('active').addEventListener('click', saveOptions);
document.getElementById('letterGrade').addEventListener('click', saveOptions);
document.getElementById('showGPA').addEventListener('click', saveOptions);
document.getElementById('gpaScale').addEventListener('click', saveOptions);
document.getElementById('gradeRounding').addEventListener('change', saveOptions);

document.getElementById('link').addEventListener('click', () => {
    chrome.tabs.create({ url: "https://github.com/gavin-ho1/canvas-gpa-calculator" });
});
