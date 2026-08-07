if (typeof importScripts !== 'undefined') {
  importScripts('browser-polyfill.min.js');
}

const DEBUG = false;

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.tabs.create({ url: browser.runtime.getURL('menus/install.html') });
  }
});

var gradeDict

// Course data (courseDict, courseRegistry, courseLinks) lives in storage.local
// rather than storage.sync: it grows unbounded across semesters/origins and can
// exceed sync's 8KB-per-item / ~100KB-total quota, and sync writes round-trip
// through Chrome's sync service adding latency we don't need for this data.
// Only small user settings (below, and in content.js/options.js) stay in sync.
const PRUNE_AGE_MS = 180 * 24 * 60 * 60 * 1000; // drop grades untouched for 180+ days

browser.storage.sync.get('gradeDict').then((result) => {
  gradeDict = result.gradeDict || {
    "A+": 12,
    "A": 11,
    "A-": 10,
    "B+": 9,
    "B": 8,
    "B-": 7,
    "C+": 6,
    "C": 5,
    "C-": 4,
    "D+": 3,
    "D": 2,
    "D-": 1,
    "F": 0
  }
  browser.storage.sync.set({ gradeDict: gradeDict });
});

//Listen for getGrade
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //Get grade of current page
  if(request.type === "courseRegistry"){
    // Merge rather than overwrite: content.js sends host-namespaced keys, so
    // merging keeps course names from other origins (e.g. real Canvas vs. the
    // sandbox demo site) intact instead of one wiping out the other.
    const incoming = request.data
    browser.storage.local.get('courseRegistry').then((result) => {
      const courseRegistry = { ...(result.courseRegistry || {}), ...incoming };
      browser.storage.local.set({ courseRegistry });
    });
    return Promise.resolve({ status: "success" });
  }

  if(request.type === "courseList"){
    // tempList entries are full URLs (already origin-specific), so a simple
    // de-duplicated merge is enough to avoid one origin's list clobbering another's.
    const tempList = request.data
    browser.storage.local.get('courseLinks').then((result) => {
      const existing = result.courseLinks || [];
      const merged = Array.from(new Set([...existing, ...tempList]));
      browser.storage.local.set({ courseLinks: merged });
    });
    return Promise.resolve({ status: "success" });
  }

  if (request.type === 'getGrades') {
    // Batched: content.js sends every grade update from one autoFetchGrades()
    // run as a single message, so this does one read-modify-write instead of
    // one per course. Per-course messages used to race each other (concurrent
    // get() calls missing each other's in-flight set()), silently dropping grades.
    const updates = request.data; // [{ key, grade, letterGrade }, ...]
    const now = new Date().getTime();

    browser.storage.local.get('courseDict').then((result) => {
      const courseDict = result.courseDict || {};

      updates.forEach(({ key, grade, letterGrade }) => {
        const existing = courseDict[key] || {};
        courseDict[key] = {
          ...existing,
          grade,
          gradePoint: gradeDict[letterGrade],
          lastUpdated: now
        };
      });

      Object.keys(courseDict).forEach((key) => {
        const entry = courseDict[key];
        if (entry.lastUpdated && (now - entry.lastUpdated > PRUNE_AGE_MS)) {
          delete courseDict[key];
        }
      });

      browser.storage.local.set({ courseDict });
      if (DEBUG) console.log("Grades saved:", updates.length);
    });
  }

  if(request.type === "print" && DEBUG){
    if(request.description !== undefined){
      console.log(request.description, request.data)
    }else{
      console.log(request.data)
    }
  }
});