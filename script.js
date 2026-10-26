document.addEventListener('DOMContentLoaded', function() {
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navLinks.classList.remove('open');
      });
    });
  }

  // Browser detection for install page / homepage CTA
  function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox/')) return 'firefox';
    if (ua.includes('Edg/')) return 'edge';
    if (ua.includes('Chrome/') || ua.includes('Chromium/')) return 'chrome';
    return null;
  }

  const browserInfo = {
    chrome: {
      label: 'Add to Chrome',
      url: 'https://chromewebstore.google.com/detail/canvas-gpa-calculator/hedjldnoldbeihmghalfbkaobifigmhi'
    },
    edge: {
      label: 'Add to Edge',
      url: 'https://microsoftedge.microsoft.com/addons/detail/canvas-gpa-calculator/kjljmlkojppfklkhdifcbbkhbalhmgfm'
    },
    firefox: {
      label: 'Add to Firefox',
      url: 'https://addons.mozilla.org/en-US/firefox/addon/canvas-gpa-calculator/'
    }
  };

  const detected = detectBrowser();

  // Homepage: point the main button straight at the right store
  const detectedButton = document.getElementById('detected-button');
  if (detectedButton && detected) {
    detectedButton.href = browserInfo[detected].url;
    detectedButton.target = '_blank';
    detectedButton.rel = 'noopener';
    detectedButton.textContent = browserInfo[detected].label;
  }

  // Install page: highlight the visitor's browser and move it first
  const storeList = document.getElementById('store-list');
  if (storeList && detected) {
    const match = storeList.querySelector('[data-browser="' + detected + '"]');
    if (match) {
      match.classList.add('detected');
      storeList.prepend(match);
    }
  }

  function getJSON(url) {
    return fetch(url).then(function(response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    });
  }

  // Live user count + rating (homepage). The HTML already holds recent
  // numbers, so a failed fetch just leaves those in place.
  const userCountElement = document.getElementById('user-count');
  const ratingElement = document.getElementById('rating');

  if (userCountElement && ratingElement) {
    getJSON('https://raw.githubusercontent.com/gavin-ho1/canvas-gpa-calculator/main/docs/extension_data.json')
      .then(function(data) {
        const totalUsers = data.chrome_extension.users + data.edge_extension.users;
        const roundedUsers = Math.floor(totalUsers / 100) * 100;
        userCountElement.textContent = roundedUsers.toLocaleString('en-US') + '+';
        ratingElement.textContent = data.chrome_extension.rating.toFixed(1);
      })
      .catch(function() {});
  }

  // Footer version, read from the extension's manifest
  const versionElements = document.querySelectorAll('.version');
  if (versionElements.length) {
    getJSON('https://raw.githubusercontent.com/gavin-ho1/canvas-gpa-calculator/main/extension/manifest.json')
      .then(function(manifest) {
        versionElements.forEach(function(el) {
          el.textContent = 'Version ' + manifest.version;
        });
      })
      .catch(function() {});
  }

  // Homepage demo: render the iframe at its real desktop width, then scale it
  // down to fit. Resizing the iframe itself would shrink Canvas's viewport and
  // collapse its grades sidebar (see .demo-embed-scale in styles.css).
  const demoFrame = document.querySelector('.demo-embed-frame');
  const demoScale = document.getElementById('demo-embed-scale');
  const demoIframe = demoScale ? demoScale.querySelector('iframe') : null;

  if (demoFrame && demoIframe) {
    const nativeWidth = 1560; // matches the max-width used inside demo/animation.html
    let nativeHeight = 690; // fallback until the iframe reports its real height

    function measureDemo() {
      try {
        const doc = demoIframe.contentDocument;
        if (doc && doc.documentElement) {
          nativeHeight = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight, nativeHeight);
        }
      } catch (e) {}
    }

    function layoutDemo() {
      demoScale.style.width = nativeWidth + 'px';
      demoScale.style.height = nativeHeight + 'px';
      demoIframe.style.width = nativeWidth + 'px';
      demoIframe.style.height = nativeHeight + 'px';
      const scale = demoFrame.clientWidth / nativeWidth;
      demoScale.style.transform = 'scale(' + scale + ')';
      demoFrame.style.height = Math.ceil(nativeHeight * scale) + 'px';
    }

    demoIframe.addEventListener('load', function() {
      measureDemo();
      layoutDemo();
    });

    // The iframe may finish loading before this script runs
    try {
      if (demoIframe.contentDocument && demoIframe.contentDocument.readyState === 'complete' && demoIframe.contentWindow.location.href !== 'about:blank') {
        measureDemo();
      }
    } catch (e) {}

    layoutDemo();
    window.addEventListener('resize', layoutDemo);
  }
});
