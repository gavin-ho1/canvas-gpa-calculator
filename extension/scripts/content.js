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

// Listen for popup messages to trigger grade fetching
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'triggerAutoFetch') {
        (async () => {
            await autoFetchGrades();
        })();
        return true;
    }
});

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
        if (el.id !== 'gpa-dashboard-display') {
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

    // Detect dashboard by URL rather than specific DOM elements.
    // Dashboard views: /, /dashboard, /?view=recent etc. (no /courses/NNN in path)
    // Course pages: /courses/123, /courses/123/grades etc.
    const onCoursePage = /\/courses\/\d+/.test(window.location.pathname);
    if (!onCoursePage) {
        await updateDashboard();
    } else {
        updateGradesPage();
    }
}

async function updateDashboard() {
    if (!showGPA) {
        document.querySelectorAll("#gpa-dashboard-display").forEach(el => el.remove());
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

    // Only show loading spinner if we have NO grades at all yet.
    // Once the first grade comes in, show the current partial GPA to avoid flickering.
    const hasAnyGrades = Object.keys(courseDict).length > 0;
    if (isAutoFetching && !hasAnyGrades && !window.location.pathname.match(/\d+/)) {
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

    // Standard Dashboard injection - inject GPA into the dashboard header.
    // Canvas has slightly different DOM structures across views (card, list,
    // recent activity, group-by-course) so we try several selectors.
    let titleSpan = null;
    const headerContainer = document.querySelector("#dashboard_header_container");

    if (headerContainer) {
        // Primary: the exact nested span structure seen in card/list views
        titleSpan = headerContainer.querySelector("div > span > span:nth-child(1) > span > span");

        // Fallback 1: any span inside a [data-cid='Heading'] element
        if (!titleSpan) {
            const heading = headerContainer.querySelector("[data-cid='Heading']");
            if (heading) {
                // Heading might have a span child, or the text might be directly inside
                titleSpan = heading.querySelector("span") || heading;
            }
        }

        // Fallback 2: any h1/h2 inside the header container
        if (!titleSpan) {
            const heading = headerContainer.querySelector("h1, h2");
            if (heading) {
                titleSpan = heading.querySelector("span") || heading;
            }
        }

        // Fallback 3: the first text-bearing child of the header container
        if (!titleSpan) {
            const firstText = headerContainer.querySelector("span, div, h1, h2, h3");
            if (firstText) titleSpan = firstText;
        }
    }

    if (titleSpan) {
        let span = titleSpan.querySelector("#gpa-dashboard-display");
        if (!span) {
            span = document.createElement("span");
            span.id = "gpa-dashboard-display";
            span.className = "canvas-gpa-calculator-injected";
            // Ensure we don't wrap block-level elements inline
            span.style.display = "inline";
            span.style.marginLeft = "0.5em";
            titleSpan.appendChild(span);
        }
        const newHTML = `ǀ GPA: ${gpaHTML}`;
        if (span.innerHTML !== newHTML) span.innerHTML = newHTML;
    }

    // Fallback: if we have a header container but couldn't find a title span,
    // append the GPA directly to the container so it's always visible.
    if (headerContainer && !titleSpan) {
        let span = headerContainer.querySelector("#gpa-dashboard-display");
        if (!span) {
            span = document.createElement("span");
            span.id = "gpa-dashboard-display";
            span.className = "canvas-gpa-calculator-injected";
            span.style.marginLeft = "0.75rem";
            span.style.fontWeight = "600";
            headerContainer.appendChild(span);
        }
        const newHTML = `ǀ GPA: ${gpaHTML}`;
        if (span.innerHTML !== newHTML) span.innerHTML = newHTML;
    }

    // Standard Dashboard cards injection - Card view
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

    // Group by Course view - inject grades into Grouping-styles__hero elements
    document.querySelectorAll(".Grouping-styles__hero").forEach(hero => {
        if (!hero.href) return;
        const match = hero.href.match(/courses\/(\d+)/);
        if (!match) return;
        const courseID = match[1];

        if (courseDict[courseID]) {
            const grade = courseDict[courseID].grade;
            const titleSpan = hero.querySelector(".Grouping-styles__title");
            
            if (titleSpan && !titleSpan.querySelector(".canvas-gpa-badge-grouping")) {
                const badge = document.createElement("span");
                badge.className = "canvas-gpa-badge-grouping canvas-gpa-calculator-injected";
                badge.textContent = ` (${grade}%)`;
                badge.style.fontWeight = "600";
                badge.style.marginLeft = "8px";
                badge.style.color = "var(--ic-brand-primary, #008EE2)";
                titleSpan.appendChild(badge);
            }
        }
    });

    // Update UI done
}

let isAutoFetching = false;

function isOurInjection(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    if (node.classList && node.classList.contains('canvas-gpa-calculator-injected')) return true;
    if (node.id === 'canvas-gpa-spinner-style') return true;
    return false;
}

function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    // Also check if any ancestor has display:none
    let parent = el.parentElement;
    while (parent) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.display === 'none') return false;
        parent = parent.parentElement;
    }
    return true;
}

function getCourseElements() {
    const courses = [];
    const seenIds = new Set();

    // Primary: Group by Course / Planner view - these are the VISIBLE course links
    // in non-card dashboard views. We check these first since they represent
    // what's actually shown on screen.
    document.querySelectorAll(".Grouping-styles__hero").forEach(link => {
        if (!link.href) return;
        const match = link.href.match(/courses\/(\d+)/);
        if (!match) return;
        const courseID = match[1];
        if (!seenIds.has(courseID)) {
            seenIds.add(courseID);
            courses.push({ id: courseID, url: link.href, element: link });
        }
    });

    // Secondary: Card view - .ic-DashboardCard with .ic-DashboardCard__link
    // These may be hidden in non-card views but still in the DOM.
    document.querySelectorAll(".ic-DashboardCard").forEach(card => {
        const link = card.querySelector(".ic-DashboardCard__link");
        if (!link) return;
        const match = link.href.match(/courses\/(\d+)/);
        if (!match) return;
        const courseID = match[1];
        if (!seenIds.has(courseID)) {
            seenIds.add(courseID);
            courses.push({ id: courseID, url: link.href, element: card });
        }
    });

    // Fallback: scan ALL links containing /courses/ID (including announcements,
    // assignments, etc.) and extract unique course IDs. This is essential for
    // the Recent Activity view where course links only appear as sub-page links.
    document.querySelectorAll('a[href*="/courses/"]').forEach(link => {
        const match = link.href.match(/courses\/(\d+)/);
        if (!match) return;
        const courseID = match[1];
        if (!seenIds.has(courseID)) {
            seenIds.add(courseID);
            // Normalize to base course URL so grade fetching works correctly
            const baseUrl = link.href.match(/(https?:\/\/[^\/]+\/courses\/\d+)/)?.[1]
                || `${window.location.origin}/courses/${courseID}`;
            courses.push({ id: courseID, url: baseUrl, element: link });
        }
    });

    return courses;
}

let allCoursesCache = null;
let allCoursesCacheTime = 0;
const ALL_COURSES_CACHE_MS = 5 * 60 * 1000; // 5 minutes

async function discoverAllCourses(skipCache = false) {
    const now = Date.now();
    if (!skipCache && allCoursesCache && (now - allCoursesCacheTime < ALL_COURSES_CACHE_MS)) {
        return allCoursesCache;
    }

    const courses = [];
    const seenIds = new Set();

    console.log('Canvas GPA: Starting course discovery...');

    // Strategy 1: Fetch the raw page HTML and parse it.
    // The server-rendered HTML usually contains .ic-DashboardCard__link elements
    // in card/list views, but in the Recent Activity view those elements are absent.
    // We therefore also scan every <a> tag for /courses/ID patterns.
    // DOMParser does NOT create shadow DOMs, so we can query inside <template> tags
    // that extensions like Better Canvas may use to hide cards.
    try {
        const response = await fetch(window.location.href);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Sub-strategy 1a: card-view links (most reliable when present)
        const cardLinks = doc.querySelectorAll('.ic-DashboardCard__link');
        console.log(`Canvas GPA: Strategy 1a: found ${cardLinks.length} card links`);
        doc.querySelectorAll('.ic-DashboardCard__link').forEach(link => {
            const match = link.href.match(/courses\/(\d+)/);
            if (match) {
                const id = match[1];
                if (!seenIds.has(id)) {
                    seenIds.add(id);
                    // Normalize to base course URL
                    const baseUrl = link.href.match(/(https?:\/\/[^\/]+\/courses\/\d+)/)?.[1] || link.href;
                    courses.push({ id, url: baseUrl });
                    console.log(`Canvas GPA: Strategy 1a: added course ${id} from ${link.href}`);
                }
            }
        });

        // Sub-strategy 1b: ANY link containing /courses/ID (needed for Recent Activity
        // view where .ic-DashboardCard__link elements are not rendered).
        // In the activity view, course links always have sub-paths like /assignments/NNN
        // or /announcements/NNN, so we can't filter them out. Instead we scan every
        // /courses/ID link, deduplicate by ID, and normalize to the base course URL.
        // We always run this (not just when 1a is empty) so we don't miss courses
        // that might appear in one strategy but not the other.
        const allCourseLinks = doc.querySelectorAll('a[href*="/courses/"]');
        console.log(`Canvas GPA: Strategy 1b: scanning ${allCourseLinks.length} total course links`);
        doc.querySelectorAll('a[href*="/courses/"]').forEach(link => {
                const match = link.href.match(/courses\/(\d+)/);
                if (!match) return;
                const id = match[1];
                if (seenIds.has(id)) return;
                seenIds.add(id);
                // Normalize to base course URL (strip any trailing path segments)
                const baseUrl = link.href.match(/(https?:\/\/[^\/]+\/courses\/\d+)/)?.[1]
                    || `${window.location.origin}/courses/${id}`;
                courses.push({ id, url: baseUrl });
                console.log(`Canvas GPA: Strategy 1b: added course ${id} from ${link.href}`);
            });

        // Sub-strategy 1c: Extract course IDs from JavaScript data objects
        // Some courses may only appear in ENV variables or other JS data, not as HTML links
        const scripts = doc.querySelectorAll('script');
        console.log(`Canvas GPA: Strategy 1c: scanning ${scripts.length} script tags for course data`);
        scripts.forEach(script => {
            if (!script.textContent) return;
            
            // Look for course IDs in various JavaScript patterns
            const courseMatches = script.textContent.match(/courses\/(\d+)/g);
            if (courseMatches) {
                courseMatches.forEach(match => {
                    const idMatch = match.match(/courses\/(\d+)/);
                    if (idMatch) {
                        const id = idMatch[1];
                        if (!seenIds.has(id)) {
                            seenIds.add(id);
                            const baseUrl = `${window.location.origin}/courses/${id}`;
                            courses.push({ id, url: baseUrl });
                            console.log(`Canvas GPA: Strategy 1c: added course ${id} from JavaScript data`);
                        }
                    }
                });
            }
        });
    } catch (e) {
        console.warn('Canvas GPA: Failed to fetch course list from page HTML:', e);
    }

    // Strategy 2: Fallback to visible DOM elements if HTML parsing yielded nothing
    // or if the fetch itself failed.
    if (courses.length === 0) {
        console.log('Canvas GPA: Strategy 1 failed, trying Strategy 2 (visible DOM fallback)');
        const visibleCourses = getCourseElements();
        console.log(`Canvas GPA: Strategy 2: found ${visibleCourses.length} visible courses`);
        visibleCourses.forEach(course => {
            if (!seenIds.has(course.id)) {
                seenIds.add(course.id);
                courses.push({ id: course.id, url: course.url });
                console.log(`Canvas GPA: Strategy 2: added course ${course.id} from visible DOM`);
            }
        });
    }

    console.log(`Canvas GPA: Discovery complete. Found ${courses.length} courses:`, courses.map(c => c.id));
    allCoursesCache = courses;
    allCoursesCacheTime = now;
    return courses;
}

async function autoFetchGrades(specificCourseID = null) {
    if (isAutoFetching && !specificCourseID) return;
    if (!specificCourseID) {
        isAutoFetching = true;
        updateUI(); // Switch to "Loading..." immediately
    }

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
        const allCourses = await discoverAllCourses();

        allCourses.forEach(course => {
            const courseData = courseDict[course.id];
            if (!courseData || !courseData.lastUpdated || (now - courseData.lastUpdated >= CACHE_TIMEOUT)) {
                courseIDsToFetch.push({ id: course.id, url: course.url });
            }
        });
    }

    // Nothing stale to fetch — show cached result immediately and bail
    if (!specificCourseID && courseIDsToFetch.length === 0) {
        isAutoFetching = false;
        updateUI();
        return;
    }

    // Fetch every stale course in parallel (much faster than sequential)
    await Promise.allSettled(courseIDsToFetch.map(async (item) => {
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

                // Preserve existing properties (e.g. 'included') when updating grade
                const existing = courseDict[item.id] || {};
                courseDict[item.id] = {
                    ...existing,
                    grade: finalGrade,
                    gradePoint: calculateGradePoint(finalGrade),
                    lastUpdated: new Date().getTime()
                };
            }
        } catch (e) {
            console.error(`Failed to fetch grades for course ${item.id}`, e);
        }
    }));

    if (!specificCourseID) {
        isAutoFetching = false;
        updateUI();
        browser.runtime.sendMessage({ type: 'autoFetchComplete' }).catch(() => {});
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

// Storage change listener — only react to actual user settings changes.
// Never reload courseDict from storage here; the in-memory courseDict is
// the source of truth once the page is loaded. Re-loading it would overwrite
// freshly-fetched grades with stale cached data and cause the GPA to flicker.
browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
        const SETTINGS_KEYS = ['active', 'letterGrade', 'showGPA', 'gpaScale', 'gradeRounding'];
        const hasSettingChange = Object.keys(changes).some(key => SETTINGS_KEYS.includes(key));
        if (!hasSettingChange) return;

        if (changes.active) active = changes.active.newValue;
        if (changes.letterGrade) letterGrades = changes.letterGrade.newValue;
        if (changes.showGPA) showGPA = changes.showGPA.newValue;
        if (changes.gpaScale) gpaScale = changes.gpaScale.newValue;
        if (changes.gradeRounding) gradeRounding = changes.gradeRounding.newValue;

        updateUI();
    }
});

// Initialization
async function init() {
    await loadSettings();

    const onDashboard = !/\/courses\/\d+/.test(window.location.pathname);

    // On the dashboard, always re-fetch grades on page load.
    // The cached courseDict from storage may be stale (grades changed in Canvas
    // since the last fetch). Clearing lastUpdated forces autoFetchGrades() to
    // refresh every course, so the user sees "Loading..." → correct current GPA
    // with no chance of a stale number getting stuck.
    if (onDashboard) {
        Object.keys(courseDict).forEach(id => {
            if (courseDict[id]) delete courseDict[id].lastUpdated;
        });
    }

    // On course pages, render the grade UI immediately.
    if (!onDashboard) {
        updateUI();
    }

    // Setup MutationObserver for Dashboard (Standard and Better Canvas)
    let debounceTimer;
    const dashboardObserver = new MutationObserver(mutations => {
        let shouldUpdate = false;
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE && !isOurInjection(node)) {
                    shouldUpdate = true;
                    break;
                }
            }
            if (shouldUpdate) break;
        }
        if (shouldUpdate) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                updateUI();
                checkForCourseObjects();
                // If new course elements appeared dynamically (e.g. Recent
                // Activity items loading after init), force re-discovery and
                // fetch grades for any newly-found courses.
                if (!isAutoFetching) {
                    const prevCount = Object.keys(courseDict).length;
                    const allCourses = await discoverAllCourses(true);
                    const hasNew = allCourses.some(c => !courseDict[c.id]?.lastUpdated);
                    if (hasNew || allCourses.length > prevCount) {
                        autoFetchGrades();
                    }
                }
            }, 300);
        }
    });
    dashboardObserver.observe(document.body, { childList: true, subtree: true });

    // Check for dashboard objects if on dashboard (URL-based for reliability)
    if (onDashboard) {
        checkForCourseObjects();
        autoFetchGrades();
        
        // Robust wait for header container / titleSpan if not yet available
        let dashboardWaitCount = 0;
        const waitForDashboard = setInterval(() => {
            const headerContainer = document.querySelector("#dashboard_header_container");
            if (headerContainer) {
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
async function checkForCourseObjects() {
    const allCourses = await discoverAllCourses();

    if (allCourses.length !== 0) {
        let courseRegistry = {};
        let tempList = [];

        allCourses.forEach(course => {
            tempList.push(course.url + "/grades?grading_period_id=0");

            // Try to find course name from visible DOM elements
            let courseName = null;

            // Group by Course view: search by course ID in hero links
            const hero = document.querySelector(`.Grouping-styles__hero[href*="/courses/${course.id}"]`);
            if (hero) {
                const titleEl = hero.querySelector(".Grouping-styles__title");
                if (titleEl) courseName = titleEl.textContent.trim();
            }

            // Card view: search by course ID in visible cards
            if (!courseName) {
                const cards = document.querySelectorAll('.ic-DashboardCard');
                for (const card of cards) {
                    const link = card.querySelector('.ic-DashboardCard__link');
                    if (link && link.href.includes(`/courses/${course.id}`)) {
                        const nameEl = card.querySelector("h2.ic-DashboardCard__header-title, .ic-DashboardCard__header-title");
                        if (nameEl) courseName = nameEl.textContent.trim();
                        break;
                    }
                }
            }

            courseRegistry[course.id] = courseName;
        });

        // Fallback: fetch raw HTML and parse for names not found in visible DOM
        const missingIds = Object.entries(courseRegistry)
            .filter(([id, name]) => !name)
            .map(([id]) => id);

        if (missingIds.length > 0) {
            try {
                const response = await fetch(window.location.href);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                for (const courseId of missingIds) {
                    let courseName = null;

                    // Try cards in parsed HTML
                    const cardLinks = doc.querySelectorAll('.ic-DashboardCard__link');
                    for (const link of cardLinks) {
                        if (link.href.includes(`/courses/${courseId}`)) {
                            const card = link.closest('.ic-DashboardCard');
                            const nameEl = card?.querySelector('.ic-DashboardCard__header-title, h2.ic-DashboardCard__header-title');
                            if (nameEl) {
                                courseName = nameEl.textContent.trim();
                                break;
                            }
                        }
                    }

                    // Try grouping heroes in parsed HTML
                    if (!courseName) {
                        const hero = doc.querySelector(`.Grouping-styles__hero[href*="/courses/${courseId}"]`);
                        if (hero) {
                            const titleEl = hero.querySelector('.Grouping-styles__title');
                            if (titleEl) courseName = titleEl.textContent.trim();
                        }
                    }

                    // Try any link with course ID that has meaningful text content
                    if (!courseName) {
                        const links = doc.querySelectorAll(`a[href*="/courses/${courseId}"]`);
                        for (const link of links) {
                            const text = link.textContent.trim();
                            if (text && text.length > 3 && !/^\d+$/.test(text) && !text.includes('/')) {
                                courseName = text;
                                break;
                            }
                        }
                    }

                    // Try script tags for ENV/course data with name near id
                    if (!courseName) {
                        const scripts = doc.querySelectorAll('script');
                        for (const script of scripts) {
                            if (!script.textContent) continue;
                            const scriptText = script.textContent;
                            const idMatch = scriptText.match(new RegExp(`id\\s*:\\s*${courseId}`));
                            if (!idMatch) continue;
                            const idIndex = idMatch.index;
                            const surrounding = scriptText.substring(Math.max(0, idIndex - 200), Math.min(scriptText.length, idIndex + 200));
                            const nameMatch = surrounding.match(/name\s*:\s*"([^"]+)"/);
                            if (nameMatch) {
                                courseName = nameMatch[1];
                                break;
                            }
                        }
                    }

                    if (courseName) {
                        courseRegistry[courseId] = courseName;
                    }
                }
            } catch (e) {
                console.warn('Canvas GPA: Failed to fetch course names from HTML:', e);
            }
        }

        // Final fallback to "Course {id}" for anything still missing
        for (const courseId of Object.keys(courseRegistry)) {
            if (!courseRegistry[courseId]) {
                courseRegistry[courseId] = `Course ${courseId}`;
            }
        }

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
