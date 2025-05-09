document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS
  AOS.init({
    once: true // animations will only run once on scroll down
  });

  // Mode toggle functionality
  const modeToggleBtn = document.getElementById('mode-toggle');
  const modeIcon = modeToggleBtn ? modeToggleBtn.querySelector('i') : null;

  // Check for saved mode preference in localStorage and set initial icon
  const savedMode = localStorage.getItem('darkMode');
  // Default to dark mode if no preference is saved or if preference is 'enabled'
  // Light mode is only applied if preference is explicitly 'disabled'
  if (savedMode === 'disabled') {
    // Apply light mode
    document.body.classList.remove('dark-mode');
    if (modeIcon) {
      modeIcon.classList.remove('fa-moon');
      modeIcon.classList.add('fa-sun');
    }
  } else {
    // Apply dark mode (default or if savedMode is 'enabled')
    document.body.classList.add('dark-mode');
    if (modeIcon) {
      modeIcon.classList.remove('fa-sun');
      modeIcon.classList.add('fa-moon');
    }
  }

  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');

      // Toggle the icon and add animation
      if (modeIcon) {
        modeIcon.classList.add('rotating'); 
        if (document.body.classList.contains('dark-mode')) {
          modeIcon.classList.remove('fa-sun');
          modeIcon.classList.add('fa-moon');
          localStorage.setItem('darkMode', 'enabled'); 
        } else {
          modeIcon.classList.remove('fa-moon');
          modeIcon.classList.add('fa-sun');
          // Save preference for light mode as 'disabled'
          localStorage.setItem('darkMode', 'disabled'); 
        }
        
        // Destroy and re-initialize tsParticles with new config
        if (window.tsParticles) {
            const oldContainer = window.tsParticles.domItem(0);
            if (oldContainer) {
                oldContainer.destroy();
            }
        }
        tsParticles.load("tsparticles", getParticlesConfig());

        setTimeout(() => {
          modeIcon.classList.remove('rotating');
        }, 600); 
      }
    });
  }

  // Sidebar toggle functionality
  const toggleBtn = document.querySelector('.toggle-btn');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const sidebarLinks = document.querySelectorAll('.sidebar a'); // Select all sidebar links

  // Set active class based on current URL
  const currentUrl = window.location.href;
  sidebarLinks.forEach(link => {
    if (link.href === currentUrl) {
      link.classList.add('active');
    } else {
      link.classList.remove('active'); // Ensure no other links have the active class statically set
    }
  });

  // Store a reference to the initially active link
  let initiallyActiveLink = document.querySelector('.sidebar a.active');

  if (toggleBtn && sidebar && mainContent) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-open'); // Toggle class on body
    });
  }

  sidebarLinks.forEach(link => {
    link.addEventListener('mouseover', function() {
      // If this link is not the active one, remove the active class from the initially active link
      if (initiallyActiveLink && this !== initiallyActiveLink) {
        initiallyActiveLink.classList.remove('active');
      }
    });

    link.addEventListener('mouseout', function() {
      // If this link is not the active one, add the active class back to the initially active link
      if (initiallyActiveLink && this !== initiallyActiveLink) {
        initiallyActiveLink.classList.add('active');
      }
    });

    link.addEventListener('click', function(e) {
      // Prevent default navigation only if sidebar is not collapsed (for smooth transition)
      if (!sidebar.classList.contains('collapsed')) {
        e.preventDefault();

        // Trigger the sidebar close animation
        sidebar.classList.add('collapsed');
        mainContent.classList.add('collapsed'); // Adjust main content
        document.body.classList.remove('sidebar-open'); // Update body class

        // Wait for the animation to complete before navigating
        setTimeout(() => {
          window.location.href = this.href; // Navigate to the clicked link's URL
        }, 350); // Match the transition duration
      }
       // If sidebar is collapsed, default navigation is allowed

      // Update the active class on click
      if (initiallyActiveLink) {
        initiallyActiveLink.classList.remove('active');
      }
      this.classList.add('active');
      // Update initiallyActiveLink reference
      initiallyActiveLink = this; // This line might cause an error if initiallyActiveLink is const
    });
  });

  // Function to display star rating
  function displayRating(rating, containerElement, averageRatingSpan) {
    containerElement.innerHTML = ''; // Clear existing content
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  }

  // Define metrics elements outside to manage scope
  const userCountElement = document.getElementById('user-count');
  const averageRatingSpan = document.getElementById('average-rating'); // Define averageRatingSpan here as well
  const metricsContainer = document.querySelector('.metrics-container');
  // The element that has the AOS animation attribute is the parent .section
  const aosSectionForMetrics = metricsContainer ? metricsContainer.closest('.section[data-aos]') : null;

  let counterHasRun = false; // Moved to higher scope

  // Animation function for the counter
  function animateCounter(element, target) {
    const start = 0;
    const duration = 1000; // Animation duration in milliseconds
    let startTime = null;

    function updateCounter(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const current = Math.min(Math.floor((progress / duration) * target), target);
      element.textContent = `${current}`; // Animate without the '+'

      if (progress < duration) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = `${target}+`; // Add '+' only at the end
      }
    }

    requestAnimationFrame(updateCounter);
  }

  let ratingCounterHasRun = false; // Flag for rating counter animation state

  // Animation function for the rating counter
  function animateRatingCounter(element, target) {
    console.log("animateRatingCounter called with target:", target); // Log when the function is called
    const start = 0;
    const duration = 1000; // Animation duration in milliseconds
    const increment = 0.01; // Define the increment step here
    let startTime = null;

    function updateCounter(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      // Calculate the raw interpolated value based on time progress
      let interpolatedValue = start + (target - start) * (progress / duration);

      // Clamp the interpolated value to the target
      interpolatedValue = Math.min(interpolatedValue, target);

      // Round down to the nearest multiple of increment
      // This ensures the counter increments in steps of 0.01
      let current = Math.floor(interpolatedValue / increment) * increment;

      // Ensure the current value does not exceed the target after rounding
      current = Math.min(current, target);

      console.log("updateCounter: progress =", progress, ", current =", current); // Log intermediate values

      // Round to two decimal places and update text content
      element.textContent = ` ${current.toFixed(2)} / 5`;

      if (progress < duration) {
        requestAnimationFrame(updateCounter);
      } else {
        // Ensure the final value is exactly the target rounded to two decimals
        element.textContent = ` ${target.toFixed(2)} / 5`;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // Moved to higher scope
  const startUserCounter = () => {
    if (counterHasRun) {
      console.log("startUserCounter: Called, but counterHasRun is true.");
      return false;
    }
    if (!userCountElement) {
      console.warn("startUserCounter: Called, but userCountElement is null.");
      return false;
    }
    if (!userCountElement.dataset || !userCountElement.dataset.target) {
      console.warn("startUserCounter: Called, but userCountElement.dataset.target is not set. Current textContent:", userCountElement.textContent);
      return false;
    }

    const target = +userCountElement.dataset.target;
    if (isNaN(target)) {
      console.warn("startUserCounter: Target (", userCountElement.dataset.target, ") is not a number.");
      return false;
    }

    // Check if textContent is '0', which indicates it's primed by fetchAndPrepareMetrics
    if (userCountElement.textContent === '0') {
      console.log("startUserCounter: Conditions met. Starting animation to target:", target);
      animateCounter(userCountElement, target);
      counterHasRun = true;
      return true; // Indicates counter started
    } else {
      console.warn("startUserCounter: Conditions not met. Target is", target, ", but textContent is '", userCountElement.textContent, "'(expected '0').");
      // If textContent is not '0' but a number, it might have been set by an earlier animation attempt or directly.
      // If it's '[Loading...]' or error, it's not ready.
      // We mark counterHasRun true if it seems like it already contains the final state or similar.
      if (userCountElement.textContent === `${target}+` || userCountElement.textContent === `${target}`) {
          console.log("startUserCounter: textContent matches target or target+. Marking as run.")
          counterHasRun = true;
      }
      return false; 
    }
  };

  // Moved to higher scope
  const startRatingCounter = () => {
      if (ratingCounterHasRun) {
          console.log("startRatingCounter: Called, but ratingCounterHasRun is true.");
          return false;
      }
      if (!averageRatingSpan) {
          console.warn("startRatingCounter: Called, but averageRatingSpan is null.");
          return false;
      }
      if (!averageRatingSpan.dataset || !averageRatingSpan.dataset.target) {
          console.warn("startRatingCounter: Called, but averageRatingSpan.dataset.target is not set. Current textContent:", averageRatingSpan.textContent);
          return false;
      }

      const target = +averageRatingSpan.dataset.target;
      if (isNaN(target)) {
          console.warn("startRatingCounter: Target (", averageRatingSpan.dataset.target, ") is not a number.");
          return false;
      }

       // Check if textContent is ' 0.00 / 5', which indicates it's primed by fetchAndPrepareMetrics
      if (averageRatingSpan.textContent === ' 0.00 / 5') {
          console.log("startRatingCounter: Conditions met. Starting animation to target:", target);
          animateRatingCounter(averageRatingSpan, target);
          ratingCounterHasRun = true;
          return true; // Indicates counter started
      } else {
          console.warn("startRatingCounter: Conditions not met. Target is", target, ", but textContent is '", averageRatingSpan.textContent, "'(expected ' 0.00 / 5').");
           // If textContent is not ' 0.00 / 5' but a number, it might have been set by an earlier animation attempt or directly.
           // We mark ratingCounterHasRun true if it seems like it already contains the final state or similar.
           if (averageRatingSpan.textContent === ` ${target.toFixed(2)} / 5`) {
              console.log("startRatingCounter: textContent matches target. Marking as run.")
              ratingCounterHasRun = true;
           }
          return false; 
      }
  };

  // Function to fetch and set the target for the counter and display rating
  async function fetchAndPrepareMetrics() {
    // const averageRatingSpan = document.getElementById('average-rating'); // Already defined outside

    // Check for all necessary elements for displaying data
    if (!userCountElement || !averageRatingSpan) {
      console.warn("User count or average rating element not found. Cannot display metrics.");
      return;
    }
    // Log a warning if the specific AOS target isn't found, but continue.
    // The counter will have a fallback start mechanism.
    if (!aosSectionForMetrics) {
        console.warn("Could not find a parent '.section[data-aos]' for '.metrics-container'. Counter animation will attempt to start on data load, not synced with AOS.");
    }

    try {
      const response = await fetch('https://raw.githubusercontent.com/gavin-ho1/canvas-gpa-calculator/main/docs/extension_data.json');
      if (!response.ok) {
        console.error(`Failed to fetch data from GitHub Pages: ${response.status}`);
        userCountElement.textContent = 'Error loading data';
        return;
      }
      const data = await response.json();

      console.log('Fetched data:', data); // Log the fetched data

      // Calculate total user count and set as data attribute
      const totalUserCount = data.chrome_extension.users + data.edge_extension.users;
      const roundedUserCount = Math.floor(totalUserCount / 100) * 100;
      
      if (userCountElement) { // Ensure element exists before setting properties
        userCountElement.dataset.target = roundedUserCount; // Store target number
        userCountElement.textContent = '0'; // Initialize display text to 0
      } else {
        console.error("userCountElement is null, cannot set target or textContent. Metrics counter will not work.");
        // If userCountElement is critical, we might want to return early or handle this error
      }

      // Calculate weighted average rating
      const totalRatingSum = (data.chrome_extension.rating * data.chrome_extension.number_of_ratings) +
                            (data.edge_extension.rating * data.edge_extension.number_of_ratings);
      const totalRatings = data.chrome_extension.number_of_ratings + data.edge_extension.number_of_ratings;
      let weightedAverageRating = totalRatingSum / totalRatings;
      // Round to two decimal places
      weightedAverageRating = Math.round(weightedAverageRating * 100) / 100;

      // Display the star rating immediately, but prepare rating span for animation
      const starRatingDiv = averageRatingSpan.querySelector('.star-rating');
      if(starRatingDiv) {
        // Display stars immediately
        displayRating(weightedAverageRating, starRatingDiv, averageRatingSpan);
      }

      // Set data target and initial text for rating animation
      if (averageRatingSpan) { // Ensure element exists before setting properties
          averageRatingSpan.dataset.target = weightedAverageRating;
          // Initialize display text to 0.00 / 5
          averageRatingSpan.textContent = ' 0.00 / 5';
      } else {
          console.error("averageRatingSpan is null, cannot set target or textContent. Rating counter will not work.");
      }

      // Logic to start counters based on 'aos-animate' class
      if (aosSectionForMetrics && userCountElement && averageRatingSpan) { // Ensure all necessary elements exist
        if (aosSectionForMetrics.classList.contains('aos-animate')) {
          console.log("aosSectionForMetrics already has 'aos-animate' on data load. Attempting to start counters.");
          startUserCounter();
          startRatingCounter();
        } else { 
          console.log("Setting up MutationObserver for 'aos-animate' on aosSectionForMetrics.");
          const observer = new MutationObserver((mutationsList, obs) => {
            for (const mutation of mutationsList) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const targetElement = mutation.target;
                if (targetElement.classList.contains('aos-animate')) {
                  console.log("'aos-animate' class added. Attempting to start counters via MutationObserver.");
                  let userCounterStarted = startUserCounter();
                  let ratingCounterStarted = startRatingCounter();
                  if (userCounterStarted && ratingCounterStarted) {
                    console.log("Both counters started by MutationObserver.");
                    obs.disconnect(); // Stop observing once both counters have successfully started
                  }
                }
              }
            }
          });
          observer.observe(aosSectionForMetrics, { attributes: true });
        }
      } else if (userCountElement && averageRatingSpan) { // Fallback if aosSectionForMetrics is not found, but counter elements exist
        console.warn("AOS target section for metrics not found. Attempting to start counters directly after data load.");
        startUserCounter();
        startRatingCounter();
      }

    } catch (error) {
      console.error('Error fetching or parsing data from GitHub Pages:', error);
      if(userCountElement) userCountElement.textContent = 'Error loading data';
      if(averageRatingSpan) averageRatingSpan.textContent = ' Error loading data';
    }
  }
  // Initialize AOS early. AOS will add 'aos-animate' class when elements come into view.
  AOS.init({
    once: true
  });

  // Function to generate tsParticles configuration
  function getParticlesConfig() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const particleColor = isDarkMode ? "#ffffff" : "#000000";
    const lineColor = isDarkMode ? "#ffffff" : "#000000";
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();

    return {
      particles: {
        number: {
          value: 50,
          density: {
            enable: true,
            area: 900
          }
        },
        color: {
          value: particleColor
        },
        shape: {
          type: "circle"
        },
        opacity: {
          value: 0.3,
          random: false,
          animation: {
            enable: false,
            speed: 1,
            minimumValue: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          animation: {
            enable: false,
            speed: 40,
            minimumValue: 0.1,
            sync: false
          }
        },
        links: {
          enable: true,
          distance: 120,
          color: lineColor,
          opacity: 0.2,
          width: 1,
          shadow: { // Added shadow for links in dark mode
            enable: isDarkMode,
            color: primaryColor,
            blur: 5
          }
        },
        move: {
          enable: true,
          speed: 3,
          direction: "none",
          random: false,
          straight: false,
          outModes: {
            default: "out"
          },
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        },
        shadow: { // Added shadow for particles in dark mode (glow effect)
          enable: isDarkMode,
          color: primaryColor,
          blur: 12,
          offset: {
            x: 0,
            y: 0
          }
        }
      },
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: {
            enable: true,
            mode: "grab"
          },
          onClick: {
            enable: false,
            mode: "push"
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 180,
            links: {
              opacity: 1
            }
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3
          },
          repulse: {
            distance: 200,
            duration: 0.4
          },
          push: {
            quantity: 4
          },
          remove: {
            quantity: 2
          }
        }
      },
      detectRetina: true,
      background: {
        color: "transparent" // Ensure tsParticles background is transparent
      },
      fullScreen: {
        enable: true,
        zIndex: -1 // Keep particles in the background
      }
    };
  }

  // Initialize tsParticles on load
  tsParticles.load("tsparticles", getParticlesConfig());

  // Initial data fetch when DOM is ready
  fetchAndPrepareMetrics().then(() => {
      console.log("fetchAndPrepareMetrics completed.");
      // Refresh AOS. This is useful if layout changes due to fetched data might affect animation triggers.
      AOS.refresh();
      console.log("AOS.refresh() called after fetchAndPrepareMetrics.");
  });

  // Scroll to top button functionality
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  if (scrollTopBtn) {
    // Function to check scroll position and toggle button visibility
    function checkScrollPosition() {
      if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
        scrollTopBtn.classList.add("show");
      } else {
        scrollTopBtn.classList.remove("show");
      }
    }

    // Check initially on page load
    checkScrollPosition();

    // Check on scroll
    window.onscroll = checkScrollPosition;

    scrollTopBtn.addEventListener("click", function() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});
