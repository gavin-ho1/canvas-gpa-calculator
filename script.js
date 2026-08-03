document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS
  AOS.init({
    once: true
  });

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
      icon: 'fab fa-chrome',
      url: 'https://chromewebstore.google.com/detail/canvas-gpa-calculator/hedjldnoldbeihmghalfbkaobifigmhi'
    },
    edge: {
      label: 'Add to Edge',
      icon: 'fab fa-edge',
      url: 'https://microsoftedge.microsoft.com/addons/detail/canvas-gpa-calculator/kjljmlkojppfklkhdifcbbkhbalhmgfm'
    },
    firefox: {
      label: 'Add to Firefox',
      icon: 'fab fa-firefox',
      url: 'https://addons.mozilla.org/en-US/firefox/addon/canvas-gpa-calculator/'
    }
  };

  const detected = detectBrowser();
  const detectedButton = document.getElementById('detected-button');
  const detectedLabel = document.getElementById('detected-label');
  const browserPick = document.getElementById('browser-pick');
  const otherBrowsers = document.getElementById('other-browsers');

  if (detectedButton) {
    const info = detected ? browserInfo[detected] : null;

    if (info) {
      detectedButton.href = info.url;
      detectedButton.innerHTML = '<i class="' + info.icon + '"></i> ' + info.label;
      if (detectedLabel) {
        detectedLabel.textContent = 'Recommended for your browser';
      }
      // Hide the matching entry from the "other browsers" list
      if (otherBrowsers) {
        const match = otherBrowsers.querySelector('[data-browser="' + detected + '"]');
        if (match) match.style.display = 'none';
      }
    } else if (browserPick) {
      // Unknown browser: hide the recommended block, show all options
      browserPick.style.display = 'none';
    }
  }

  // Function to display star rating
  function displayRating(rating, containerElement) {
    containerElement.innerHTML = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < fullStars; i++) {
      containerElement.innerHTML += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
      containerElement.innerHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
      containerElement.innerHTML += '<i class="far fa-star"></i>';
    }
  }

  const userCountElement = document.getElementById('user-count');
  const averageRatingSpan = document.getElementById('average-rating');
  const metricsContainer = document.querySelector('.stats-row');
  const aosSectionForMetrics = metricsContainer ? metricsContainer.closest('[data-aos]') : null;

  let counterHasRun = false;

  function animateCounter(element, target) {
    const duration = 1000;
    let startTime = null;

    function updateCounter(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const current = Math.min(Math.floor((progress / duration) * target), target);
      element.textContent = `${current}`;

      if (progress < duration) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = `${target}+`;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  let ratingCounterHasRun = false;

  function animateRatingCounter(element, target) {
    const start = 0;
    const duration = 1000;
    const increment = 0.01;
    let startTime = null;

    function updateCounter(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      let interpolatedValue = start + (target - start) * (progress / duration);
      interpolatedValue = Math.min(interpolatedValue, target);
      let current = Math.floor(interpolatedValue / increment) * increment;
      current = Math.min(current, target);
      element.textContent = ` ${current.toFixed(2)} / 5`;

      if (progress < duration) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = ` ${target.toFixed(2)} / 5`;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  const startUserCounter = () => {
    if (counterHasRun) return false;
    if (!userCountElement || !userCountElement.dataset || !userCountElement.dataset.target) return false;

    const target = +userCountElement.dataset.target;
    if (isNaN(target)) return false;

    if (userCountElement.textContent === '0') {
      animateCounter(userCountElement, target);
      counterHasRun = true;
      return true;
    } else {
      if (userCountElement.textContent === `${target}+` || userCountElement.textContent === `${target}`) {
        counterHasRun = true;
      }
      return false;
    }
  };

  const startRatingCounter = () => {
    if (ratingCounterHasRun) return false;
    if (!averageRatingSpan || !averageRatingSpan.dataset || !averageRatingSpan.dataset.target) return false;

    const target = +averageRatingSpan.dataset.target;
    if (isNaN(target)) return false;

    if (averageRatingSpan.textContent === ' 0.00 / 5') {
      animateRatingCounter(averageRatingSpan, target);
      ratingCounterHasRun = true;
      return true;
    } else {
      if (averageRatingSpan.textContent === ` ${target.toFixed(2)} / 5`) {
        ratingCounterHasRun = true;
      }
      return false;
    }
  };

  async function fetchAndPrepareMetrics() {
    if (!userCountElement || !averageRatingSpan) return;

    try {
      const response = await fetch('https://raw.githubusercontent.com/gavin-ho1/canvas-gpa-calculator/main/docs/extension_data.json');
      if (!response.ok) {
        userCountElement.textContent = 'Error loading data';
        return;
      }
      const data = await response.json();

      const totalUserCount = data.chrome_extension.users + data.edge_extension.users;
      const roundedUserCount = Math.floor(totalUserCount / 100) * 100;

      userCountElement.dataset.target = roundedUserCount;
      userCountElement.textContent = '0';

      const totalRatingSum = (data.chrome_extension.rating * data.chrome_extension.number_of_ratings) +
                            (data.edge_extension.rating * data.edge_extension.number_of_ratings);
      const totalRatings = data.chrome_extension.number_of_ratings + data.edge_extension.number_of_ratings;
      let weightedAverageRating = totalRatingSum / totalRatings;
      weightedAverageRating = Math.round(weightedAverageRating * 100) / 100;

      const starRatingDiv = averageRatingSpan.querySelector('.star-rating');
      if (starRatingDiv) {
        displayRating(weightedAverageRating, starRatingDiv);
      }

      averageRatingSpan.dataset.target = weightedAverageRating;
      averageRatingSpan.textContent = ' 0.00 / 5';

      if (aosSectionForMetrics) {
        if (aosSectionForMetrics.classList.contains('aos-animate')) {
          startUserCounter();
          startRatingCounter();
        } else {
          const observer = new MutationObserver((mutationsList, obs) => {
            for (const mutation of mutationsList) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const targetElement = mutation.target;
                if (targetElement.classList.contains('aos-animate')) {
                  const userCounterStarted = startUserCounter();
                  const ratingCounterStarted = startRatingCounter();
                  if (userCounterStarted && ratingCounterStarted) {
                    obs.disconnect();
                  }
                }
              }
            }
          });
          observer.observe(aosSectionForMetrics, { attributes: true });
        }
      } else {
        startUserCounter();
        startRatingCounter();
      }
    } catch (error) {
      if (userCountElement) userCountElement.textContent = 'Error loading data';
      if (averageRatingSpan) averageRatingSpan.textContent = ' Error loading data';
    }
  }

  if (userCountElement && averageRatingSpan) {
    fetchAndPrepareMetrics().then(() => {
      AOS.refresh();
    });
  }

  // Scroll to top button
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  if (scrollTopBtn) {
    function checkScrollPosition() {
      if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
        scrollTopBtn.classList.add("show");
      } else {
        scrollTopBtn.classList.remove("show");
      }
    }

    checkScrollPosition();
    window.onscroll = checkScrollPosition;

    scrollTopBtn.addEventListener("click", function() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});
