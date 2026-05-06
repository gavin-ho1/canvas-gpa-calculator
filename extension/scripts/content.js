browser.runtime.sendMessage({ type: 'print', data : "content.js is running" });

let active, letterGrades, showGPA, gpaScale, gradeRounding;
let courseDict = {};

async function loadSettings() {
    const items = await browser.storage.sync.get({
        active: true,
        letterGrade: true,
        showGPA: true,
        gpaScale: false,
        gradeRounding: 0
    });
    active = items.active;
    letterGrades = items.letterGrade;
    showGPA = items.showGPA;
    gpaScale = items.gpaScale;
    gradeRounding = items.gradeRounding;

    const dictResult = await browser.storage.sync.get('courseDict');
    courseDict = dictResult.courseDict || {};
}

function calculateGradePoint(grade) {
    const roundedGrade = grade + gradeRounding;
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
}

function getLetterGrade(grade) {
    const roundedGrade = grade + gradeRounding;
    if (roundedGrade >= 97) return "A+";
    if (roundedGrade >= 93) return "A";
    if (roundedGrade >= 90) return "A-";
    if (roundedGrade >= 87) return "B+";
    if (roundedGrade >= 83) return "B";
    if (roundedGrade >= 80) return "B-";
    if (roundedGrade >= 77) return "C+";
    if (roundedGrade >= 73) return "C";
    if (roundedGrade >= 70) return "C-";
    if (roundedGrade >= 67) return "D+";
    if (roundedGrade >= 63) return "D";
    if (roundedGrade >= 60) return "D-";
    if (isNaN(grade)) return "None";
    return "F";
}

function clearInjections() {
    document.querySelectorAll(".canvas-gpa-calculator-injected").forEach(el => el.remove());
    // Also show any hidden elements we hid
    const gradeDivs = document.querySelectorAll('#student-grades-final');
    gradeDivs.forEach(div => {
        if (div.classList.contains("canvas-gpa-calculator-hidden")) {
            div.style.display = '';
            div.classList.remove("canvas-gpa-calculator-hidden");
        }
    });
}

async function updateUI() {
    clearInjections();
    if (!active) return;

    const dashboardSpan = document.querySelector("span.mobile-header-title");
    if (dashboardSpan) {
        await updateDashboard();
    } else {
        updateGradesPage();
    }
}

async function updateDashboard() {
    if (!showGPA) return;

    let totalGPA = 0;
    let count = 0;

    Object.keys(courseDict).forEach(key => {
        let grade = courseDict[key].grade;
        let gradePoint = calculateGradePoint(grade);

        if (!gpaScale) {
            gradePoint /= 3;
            gradePoint = Math.ceil(gradePoint);
        }
        totalGPA += gradePoint;
        count++;
    });

    let displayGPA = count > 0 ? (totalGPA / count) : NaN;
    let gpaText = isNaN(displayGPA) ? "No course grades saved" : displayGPA.toFixed(2);

    // Better Canvas support
    const betterCanvas = document.querySelector("#bettercanvas-aesthetics");
    if (betterCanvas) {
        const gpaCardUnweighted = document.querySelector("#bettercanvas-gpa-unweighted");
        const gpaCardWeighted = document.querySelector("#bettercanvas-gpa-weighted");
        if (gpaCardUnweighted && gpaCardWeighted) {
            gpaCardUnweighted.innerHTML = gpaText;
            gpaCardWeighted.innerHTML = gpaText;
        }

        const betterCanvasCards = document.querySelectorAll("a.bettercanvas-card-grade");
        betterCanvasCards.forEach(card => {
            const url = card.href;
            Object.keys(courseDict).forEach(key => {
                if (url.match(key)) {
                    card.textContent = `${courseDict[key].grade}%`;
                }
            });
        });
    }

    // Standard Dashboard injection
    const titleSpan = document.querySelector("#dashboard_header_container > div > span > span:nth-child(1) > span > span");
    if (titleSpan && !titleSpan.querySelector("#gpa-dashboard-display")) {
        const span = document.createElement("span");
        span.id = "gpa-dashboard-display";
        span.className = "canvas-gpa-calculator-injected";
        span.textContent = ` ǀ GPA: ${gpaText}`;
        titleSpan.appendChild(span);
    }

    // List view and Activity view
    const listHeader = document.querySelector("h2.css-tz46fa-view-heading div");
    if (listHeader && !listHeader.querySelector("#gpa-list-display")) {
        const span = document.createElement("span");
        span.id = "gpa-list-display";
        span.className = "canvas-gpa-calculator-injected";
        span.textContent = ` ǀ GPA: ${gpaText}`;
        span.style.fontWeight = "bold";
        listHeader.appendChild(span);
    }

    const activityHeader = document.querySelector("h2.recent-activity-header");
    if (activityHeader && !activityHeader.querySelector("#gpa-activity-display")) {
        const span = document.createElement("span");
        span.id = "gpa-activity-display";
        span.className = "canvas-gpa-calculator-injected";
        span.textContent = ` ǀ GPA: ${gpaText}`;
        span.style.fontWeight = "bold";
        activityHeader.appendChild(span);
    }
}

function updateGradesPage() {
    const hyperLink = document.querySelector("a.mobile-header-title.expandable");
    if (!hyperLink) return;

    const match = hyperLink.href.match(/\d+/);
    const courseID = match ? match[0] : null;

    let weightedGradingEnabled = false;
    const gradeHeaders = document.querySelectorAll('h2');
    gradeHeaders.forEach(header => {
        if (header.textContent.trim() === "Assignments are weighted by group:") {
            weightedGradingEnabled = true;
        }
    });

    let finalGrade = NaN;
    if (weightedGradingEnabled) {
        let weightDict = {};
        let pointDict = {};
        let totalPointDict = {};

        const weightRows = document.querySelectorAll('table.summary tbody tr');
        weightRows.forEach(row => {
            const groupTh = row.querySelector('th');
            const weightTd = row.querySelector('td');
            if (groupTh && weightTd) {
                const groupName = groupTh.textContent.trim();
                const weightText = weightTd.textContent.trim();
                if (groupName !== "Total") {
                    weightDict[groupName] = parseFloat(weightText.replace("%", ""));
                    pointDict[groupName] = 0;
                    totalPointDict[groupName] = 0;
                }
            }
        });

        const assignmentRows = document.querySelectorAll('#grades_summary tr.student_assignment');
        assignmentRows.forEach(row => {
            const categoryDiv = row.querySelector('th.title div.context');
            const category = categoryDiv ? categoryDiv.textContent.trim() : null;
            const scoreSpan = row.querySelector('td.assignment_score span.grade');
            if (scoreSpan) {
                let scoreText = scoreSpan.textContent.replace(/Click to test a different score/g, '').trim();
                let scoreMatch = scoreText.match(/(\d+(\.\d+)?)/);
                let totalSpan = scoreSpan.nextElementSibling;
                let totalText = totalSpan ? totalSpan.textContent.trim() : "";
                let totalMatch = totalText.match(/(\d+(\.\d+)?)/);
                if (scoreMatch && totalMatch) {
                    let s = parseFloat(scoreMatch[0]);
                    let t = parseFloat(totalMatch[0]);
                    if (category && weightDict.hasOwnProperty(category)) {
                        pointDict[category] += s;
                        totalPointDict[category] += t;
                    }
                }
            }
        });

        let countedWeight = 0;
        let weightedSum = 0;
        Object.keys(weightDict).forEach(category => {
            if (totalPointDict[category] !== 0) {
                weightedSum += (pointDict[category] / totalPointDict[category]) * weightDict[category];
                countedWeight += weightDict[category];
            }
        });
        if (countedWeight > 0) {
            finalGrade = (weightedSum / countedWeight) * 100;
        }
    } else {
        let points = 0;
        let totalPoints = 0;
        const assignmentRows = document.querySelectorAll('#grades_summary tr.student_assignment');
        assignmentRows.forEach(row => {
            const scoreSpan = row.querySelector('td.assignment_score span.grade');
            if (scoreSpan) {
                let scoreText = scoreSpan.textContent.replace(/Click to test a different score/g, '').trim();
                let scoreMatch = scoreText.match(/(\d+(\.\d+)?)/);
                let totalSpan = scoreSpan.nextElementSibling;
                let totalText = totalSpan ? totalSpan.textContent.trim() : "";
                let totalMatch = totalText.match(/(\d+(\.\d+)?)/);
                if (scoreMatch && totalMatch) {
                    points += parseFloat(scoreMatch[0]);
                    totalPoints += parseFloat(totalMatch[0]);
                }
            }
        });
        if (totalPoints > 0) {
            finalGrade = (points / totalPoints) * 100;
        }
    }

    if (!isNaN(finalGrade)) {
        finalGrade = parseFloat(finalGrade.toFixed(2));
    }

    const letterGrade = getLetterGrade(finalGrade);

    // Update storage/background
    if (!isNaN(finalGrade) && courseID) {
        browser.runtime.sendMessage({ type: "getGrade", data: [finalGrade, courseID, letterGrade] });
    }

    // UI Updates
    const displayAside = document.querySelector("#right-side #student-grades-right-content");
    if (displayAside) {
        // Remove existing final grade if any (native Canvas one or our previous injection)
        document.querySelectorAll("div.student_assignment.final_grade").forEach(el => {
            if (el.textContent.includes("Total:")) {
                el.remove();
            }
        });

        const div = document.createElement("div");
        div.className = "student_assignment final_grade canvas-gpa-calculator-injected";
        div.id = "gpa-grades-display";

        if (isNaN(finalGrade)) {
            div.innerHTML = `Total: <span class="grade">No assignments graded</span>`;
        } else {
            if (letterGrades) {
                div.innerHTML = `Total: <span class="grade">${finalGrade}%</span> (<span class="letter_grade">${letterGrade}</span>)`;
            } else {
                div.innerHTML = `Total: <span class="grade">${finalGrade}%</span>`;
            }
        }
        displayAside.prepend(div);
    }

    // Clean up "Calculation of totals has been disabled" message
    const gradeDivs = document.querySelectorAll('#student-grades-final');
    gradeDivs.forEach(div => {
        if (div.textContent.trim() === "Calculation of totals has been disabled") {
            div.style.display = 'none';
            div.classList.add("canvas-gpa-calculator-hidden");
        }
    });
}

// Storage change listener
browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
        loadSettings().then(() => {
            updateUI();
        });
    }
});

// Initialization
async function init() {
    await loadSettings();
    
    // Initial update
    updateUI();

    // Check for dashboard objects if on dashboard
    if (document.querySelector("span.mobile-header-title")) {
        checkForCourseObjects();
        
        // Robust wait for titleSpan if it's not yet available
        let dashboardWaitCount = 0;
        const waitForDashboard = setInterval(() => {
            const titleSpan = document.querySelector("#dashboard_header_container > div > span > span:nth-child(1) > span > span");
            if (titleSpan) {
                updateUI();
                clearInterval(waitForDashboard);
            } else if (dashboardWaitCount > 20) { // Stop after 10 seconds
                clearInterval(waitForDashboard);
            }
            dashboardWaitCount++;
        }, 500);
    }

    // Better Canvas mutation observer
    const betterCanvas = document.querySelector("#bettercanvas-aesthetics");
    if (betterCanvas) {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && (node.classList.contains('bettercanvas-card-grade') || node.classList.contains("bettercanvas-gpa-card"))) {
                            updateUI();
                        }
                    });
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

let maxLoop = 0;
function checkForCourseObjects() {
    const courseObjs = Array.from(document.querySelectorAll("a.ic-DashboardCard__link"));
    const courseNames = Array.from(document.querySelectorAll("h3 span"));

    if (courseObjs.length !== 0) {
        let courseRegistry = {};
        let tempList = [];
        courseObjs.forEach((course, index) => {
            tempList.push(course.href + "/grades?grading_period_id=0");
            const match = course.href.match(/\d+/);
            if (match && courseNames[index]) {
                courseRegistry[match[0]] = courseNames[index].innerHTML;
            }
        });

        browser.runtime.sendMessage({ type: 'courseList', data: tempList });
        browser.runtime.sendMessage({ type: 'courseRegistry', data: courseRegistry });
    } else {
        if (maxLoop < 10) {
            maxLoop++;
            setTimeout(checkForCourseObjects, 1000);
        }
    }
}

// Start the extension
if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}
