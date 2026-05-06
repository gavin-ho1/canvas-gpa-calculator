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

function calculateGradeFromDoc(doc) {
    let weightedGradingEnabled = false;
    const gradeHeaders = doc.querySelectorAll('h2');
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

        const weightRows = doc.querySelectorAll('table.summary tbody tr');
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

        const assignmentRows = doc.querySelectorAll('#grades_summary tr.student_assignment');
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
        const assignmentRows = doc.querySelectorAll('#grades_summary tr.student_assignment');
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
    return finalGrade;
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
    document.querySelectorAll(".canvas-gpa-calculator-injected").forEach(el => {
        if (!['gpa-dashboard-display', 'gpa-list-display', 'gpa-activity-display'].includes(el.id)) {
            el.remove();
        }
    });
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
    if (!active) {
        // Completely remove all injected elements when disabled
        document.querySelectorAll(".canvas-gpa-calculator-injected").forEach(el => el.remove());
        
        // Restore hidden native grade displays
        document.querySelectorAll('#student-grades-final.canvas-gpa-calculator-hidden').forEach(div => {
            div.style.display = '';
            div.classList.remove("canvas-gpa-calculator-hidden");
        });
        
        // Restore Better Canvas badges
        document.querySelectorAll("a.bettercanvas-card-grade").forEach(card => {
            if (card.style.display === 'none') card.style.display = '';
        });
        document.querySelectorAll(".canvas-gpa-bc-badge").forEach(el => el.remove());
        
        return;
    }

    clearInjections();

    const dashboardSpan = document.querySelector("span.mobile-header-title");
    if (dashboardSpan) {
        await updateDashboard();
    } else {
        updateGradesPage();
    }
}

async function updateDashboard() {
    if (!showGPA) {
        document.querySelectorAll("#gpa-dashboard-display, #gpa-list-display, #gpa-activity-display").forEach(el => el.remove());
        const gpaCardUnweighted = document.querySelector("#bettercanvas-gpa-unweighted");
        const gpaCardWeighted = document.querySelector("#bettercanvas-gpa-weighted");
        if (gpaCardUnweighted) gpaCardUnweighted.innerHTML = '--';
        if (gpaCardWeighted) gpaCardWeighted.innerHTML = '--';
        return;
    }

    let totalGPA = 0;
    let count = 0;

    Object.keys(courseDict).forEach(key => {
        if (courseDict[key].included === false) return; // Skip explicitly excluded courses

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
    let gpaHTML = gpaText;

    if (isAutoFetching && !window.location.pathname.match(/\d+/)) {
        if (!document.getElementById("canvas-gpa-spinner-style")) {
            const style = document.createElement("style");
            style.id = "canvas-gpa-spinner-style";
            style.innerHTML = `@keyframes canvas-gpa-spin { to { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }
        gpaHTML = `Loading <span style="display: inline-block; width: 12px; height: 12px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: canvas-gpa-spin 1s linear infinite; vertical-align: middle; margin-left: 4px;"></span>`;
    }

    // Better Canvas specific global GPA injection
    const betterCanvas = document.querySelector("#bettercanvas-aesthetics");
    if (betterCanvas) {
        const gpaCardUnweighted = document.querySelector("#bettercanvas-gpa-unweighted");
        const gpaCardWeighted = document.querySelector("#bettercanvas-gpa-weighted");
        if (gpaCardUnweighted && gpaCardWeighted) {
            if (gpaCardUnweighted.innerHTML !== gpaHTML) {
                gpaCardUnweighted.innerHTML = gpaHTML;
                gpaCardWeighted.innerHTML = gpaHTML;
            }
        }
    }

    // Better Canvas card grade injection
    const betterCanvasCards = document.querySelectorAll("a.bettercanvas-card-grade");
    betterCanvasCards.forEach(card => {
        const url = card.href;
        const match = url.match(/courses\/(\d+)/);
        if (match) {
            const courseID = match[1];
            if (courseDict[courseID] && !isNaN(courseDict[courseID].grade)) {
                const gradeText = `${courseDict[courseID].grade}%`;
                
                // Hide Better Canvas's original text element to prevent conflicts
                card.style.display = 'none';
                
                let container = card.parentNode;
                let myBadge = container.querySelector('.canvas-gpa-bc-badge');
                
                if (!myBadge) {
                    myBadge = document.createElement('a');
                    myBadge.href = url;
                    myBadge.className = 'canvas-gpa-bc-badge';
                    myBadge.style.cssText = `
                        display: block;
                        position: absolute;
                        padding: 0.125rem 0.5rem;
                        border-radius: 9999px;
                        top: 0.75rem;
                        left: 0.75rem;
                        background-color: var(--bcbackground-0-ungradient, #ffffff);
                        color: var(--bctext-0, #000);
                        opacity: 1;
                        font-weight: 600;
                        text-decoration: none;
                        z-index: 10;
                    `;
                    container.appendChild(myBadge);
                }
                
                if (myBadge.textContent !== gradeText) {
                    myBadge.textContent = gradeText;
                }
            }
        }
    });

    // Standard Dashboard injection
    const titleSpan = document.querySelector("#dashboard_header_container > div > span > span:nth-child(1) > span > span");
    if (titleSpan) {
        let span = titleSpan.querySelector("#gpa-dashboard-display");
        if (!span) {
            span = document.createElement("span");
            span.id = "gpa-dashboard-display";
            span.className = "canvas-gpa-calculator-injected";
            titleSpan.appendChild(span);
        }
        const newHTML = ` ǀ GPA: ${gpaHTML}`;
        if (span.innerHTML !== newHTML) span.innerHTML = newHTML;
    }

    // List view and Activity view
    const listHeader = document.querySelector("h2.css-tz46fa-view-heading div");
    if (listHeader) {
        let span = listHeader.querySelector("#gpa-list-display");
        if (!span) {
            span = document.createElement("span");
            span.id = "gpa-list-display";
            span.className = "canvas-gpa-calculator-injected";
            span.style.fontWeight = "bold";
            listHeader.appendChild(span);
        }
        const newHTML = ` ǀ GPA: ${gpaHTML}`;
        if (span.innerHTML !== newHTML) span.innerHTML = newHTML;
    }

    const activityHeader = document.querySelector("h2.recent-activity-header");
    if (activityHeader) {
        let span = activityHeader.querySelector("#gpa-activity-display");
        if (!span) {
            span = document.createElement("span");
            span.id = "gpa-activity-display";
            span.className = "canvas-gpa-calculator-injected";
            span.style.fontWeight = "bold";
            activityHeader.appendChild(span);
        }
        const newHTML = ` ǀ GPA: ${gpaHTML}`;
        if (span.innerHTML !== newHTML) span.innerHTML = newHTML;
    }

    // Standard Dashboard cards injection
    const dashboardCards = document.querySelectorAll(".ic-DashboardCard");
    dashboardCards.forEach(card => {
        const link = card.querySelector(".ic-DashboardCard__link");
        if (!link) return;
        const match = link.href.match(/courses\/(\d+)/);
        if (!match) return;
        const courseID = match[1];

        if (courseDict[courseID]) {
            const grade = courseDict[courseID].grade;
            
            // If Better Canvas grade is already present, don't inject our badge to avoid clutter
            const hasBetterCanvasGrade = card.querySelector(".bettercanvas-card-grade");
            if (hasBetterCanvasGrade) return;

            const subtitle = card.querySelector(".ic-DashboardCard__header-subtitle");
            if (subtitle && !subtitle.querySelector(".canvas-gpa-badge")) {
                const badge = document.createElement("span");
                badge.className = "canvas-gpa-badge canvas-gpa-calculator-injected";
                badge.textContent = `Grade: ${grade}%`;
                badge.style.display = "inline-block";
                badge.style.marginTop = "8px";
                badge.style.padding = "4px 10px";
                badge.style.borderRadius = "6px";
                badge.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
                badge.style.fontWeight = "600";
                badge.style.fontSize = "12px";
                badge.style.color = "var(--ic-brand-primary, #008EE2)";
                badge.style.border = "1px solid rgba(0, 0, 0, 0.1)";
                subtitle.appendChild(badge);
            }
        }
    });

    // Update UI done
}

let isAutoFetching = false;
async function autoFetchGrades(specificCourseID = null) {
    if (isAutoFetching && !specificCourseID) return;
    if (!specificCourseID) isAutoFetching = true;

    const now = new Date().getTime();
    const CACHE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const SHORT_CACHE = 60 * 1000; // 1 minute for specific fetches to prevent spam

    const courseIDsToFetch = [];
    if (specificCourseID) {
        const courseData = courseDict[specificCourseID];
        if (courseData && courseData.lastUpdated && (now - courseData.lastUpdated < SHORT_CACHE)) {
            return; // Data is fresh enough, skip fetch
        }
        courseIDsToFetch.push({ id: specificCourseID, url: `${window.location.origin}/courses/${specificCourseID}` });
    } else {
        const dashboardCards = document.querySelectorAll(".ic-DashboardCard");

        dashboardCards.forEach(card => {
            const link = card.querySelector(".ic-DashboardCard__link");
            if (!link) return;
            const match = link.href.match(/courses\/(\d+)/);
            if (!match) return;
            const courseID = match[1];

            const courseData = courseDict[courseID];
            if (!courseData || !courseData.lastUpdated || (now - courseData.lastUpdated >= CACHE_TIMEOUT)) {
                courseIDsToFetch.push({ id: courseID, url: link.href });
            }
        });
    }

    for (const item of courseIDsToFetch) {
        try {
            const fetchUrl = `${item.url}/grades?grading_period_id=0`;
            const response = await fetch(fetchUrl);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const finalGrade = calculateGradeFromDoc(doc);
            const letterGrade = getLetterGrade(finalGrade);

            if (!isNaN(finalGrade)) {
                browser.runtime.sendMessage({ type: "getGrade", data: [finalGrade, item.id, letterGrade] });
                
                courseDict[item.id] = {
                    grade: finalGrade,
                    gradePoint: calculateGradePoint(finalGrade),
                    lastUpdated: new Date().getTime()
                };
                
                if (!specificCourseID) {
                    await new Promise(r => setTimeout(r, 100));
                    updateUI(); 
                }
            }
        } catch (e) {
            console.error(`Failed to fetch grades for course ${item.id}`, e);
        }
    }
    if (!specificCourseID) {
        isAutoFetching = false;
        updateUI();
    }
}

let gradesObserver = null;

function updateGradesPage() {
    const hyperLink = document.querySelector("a.mobile-header-title.expandable");
    if (!hyperLink) return;

    const match = hyperLink.href.match(/\d+/);
    const courseID = match ? match[0] : null;

    const finalGrade = calculateGradeFromDoc(document);

    // Setup MutationObserver for dynamic updates (What-If scores)
    if (!gradesObserver) {
        const target = document.querySelector('#grades_summary');
        if (target) {
            gradesObserver = new MutationObserver(() => {
                updateGradesPage();
            });
            gradesObserver.observe(target, { childList: true, subtree: true, characterData: true });
        }
    }

    const letterGrade = getLetterGrade(finalGrade);

    // Trigger background sync for GPA calculation (real grade only)
    if (courseID) {
        autoFetchGrades(courseID);
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

    // Setup MutationObserver for Dashboard (Standard and Better Canvas)
    let debounceTimer;
    const dashboardObserver = new MutationObserver(mutations => {
        let shouldUpdate = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                shouldUpdate = true;
                break;
            }
        }
        if (shouldUpdate) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                updateUI();
                checkForCourseObjects();
            }, 300);
        }
    });
    dashboardObserver.observe(document.body, { childList: true, subtree: true });

    // Check for dashboard objects if on dashboard
    if (document.querySelector("span.mobile-header-title") || document.querySelector(".ic-DashboardCard__container")) {
        checkForCourseObjects();
        autoFetchGrades(); // Only trigger fetch once on initialization
        
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
