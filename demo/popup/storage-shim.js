// Stand-in for the extension's browser.storage / browser.tabs APIs so the
// REAL, unmodified options.html/options.js from the extension can run
// outside of an actual browser-extension context, for demo purposes only.
(function () {
  const store = {
    active: false, // demo starts "off" so the toggle has something to demonstrate
    letterGrade: true,
    showGPA: true,
    gpaScale: false,
    gradeRounding: 0,
    courseRegistry: {},
    courseDict: {}
  };
  const listeners = [];

  function get(keys) {
    return new Promise((resolve) => {
      let result = {};
      if (Array.isArray(keys)) {
        keys.forEach((k) => (result[k] = store[k]));
      } else if (keys && typeof keys === 'object') {
        Object.keys(keys).forEach((k) => (result[k] = k in store ? store[k] : keys[k]));
      } else {
        result = Object.assign({}, store);
      }
      resolve(result);
    });
  }

  function set(obj) {
    return new Promise((resolve) => {
      const changes = {};
      Object.keys(obj).forEach((k) => {
        changes[k] = { oldValue: store[k], newValue: obj[k] };
        store[k] = obj[k];
      });
      resolve();
      listeners.forEach((fn) => fn(changes, 'sync'));
      try {
        window.parent.postMessage({ source: 'cgpa-popup-shim', type: 'storage-set', values: obj }, '*');
      } catch (e) {}
    });
  }

  function remove(keys) {
    return new Promise((resolve) => {
      (Array.isArray(keys) ? keys : [keys]).forEach((k) => delete store[k]);
      resolve();
    });
  }

  window.browser = {
    storage: {
      sync: { get, set, remove },
      onChanged: { addListener: (fn) => listeners.push(fn) }
    },
    tabs: {
      // No-op in the demo: real extension links (GitHub, store review pages)
      // must not navigate away from or break this embedded popup.
      create: () => {}
    },
    runtime: {
      sendMessage: () => Promise.resolve(),
      onMessage: { addListener: () => {} }
    }
  };

  // Belt-and-suspenders: block default navigation on every link in the
  // popup, since some of them (the review badges) have real hrefs and no
  // JS handler at all.
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (a) e.preventDefault();
  }, true);
})();
