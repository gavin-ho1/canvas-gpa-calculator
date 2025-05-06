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
  if (savedMode) {
    document.body.classList.add('dark-mode');
    if (modeIcon) {
      modeIcon.classList.remove('fa-sun');
      modeIcon.classList.add('fa-moon');
    }
  } else {
     if (modeIcon) {
      modeIcon.classList.remove('fa-moon');
      modeIcon.classList.add('fa-sun');
    }
  }

  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');

      // Toggle the icon and add animation
      if (modeIcon) {
        modeIcon.classList.add('rotating'); // Add rotating class to trigger animation
        if (document.body.classList.contains('dark-mode')) {
          modeIcon.classList.remove('fa-sun');
          modeIcon.classList.add('fa-moon');
          localStorage.setItem('darkMode', 'enabled'); // Save the preference to localStorage
        } else {
          modeIcon.classList.remove('fa-moon');
          modeIcon.classList.add('fa-sun');
          localStorage.removeItem('darkMode'); // Remove the preference from localStorage
        }
         // Remove the rotating class after the animation completes
        setTimeout(() => {
          modeIcon.classList.remove('rotating');
        }, 600); // Match the animation duration
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
  function displayStarRating(rating, containerElement, averageRatingSpan) {
    containerElement.innerHTML = ''; // Clear existing content
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      const starIcon = document.createElement('i');
      starIcon.classList.add('fas', 'fa-star');
      containerElement.appendChild(starIcon);
    }

    // Add half star
    if (halfStar) {
      const halfStarIcon = document.createElement('i');
      halfStarIcon.classList.add('fas', 'fa-star-half-alt');
      containerElement.appendChild(halfStarIcon);
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      const emptyStarIcon = document.createElement('i');
      emptyStarIcon.classList.add('far', 'fa-star'); // Use far for empty stars
      containerElement.appendChild(emptyStarIcon);
    }
    averageRatingSpan.textContent = ` ${rating.toFixed(1)} / 5`;
  }

  // Define metrics elements outside to manage scope
  const metricsSection = document.querySelector('.metrics-container');
  const userCountElement = document.getElementById('user-count');

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

  // Function to fetch and set the target for the counter and display rating
  async function fetchAndPrepareMetrics() {
    const averageRatingSpan = document.getElementById('average-rating');

    if (!userCountElement || !averageRatingSpan || !metricsSection) { // Added metricsSection to check
      console.warn("One or more required elements for metrics not found.");
      return;
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
      userCountElement.dataset.target = roundedUserCount; // Store target number
      userCountElement.textContent = '0'; // Initialize display text to 0

      // Calculate weighted average rating
      const totalRatingSum = (data.chrome_extension.rating * data.chrome_extension.number_of_ratings) +
                            (data.edge_extension.rating * data.edge_extension.number_of_ratings);
      const totalRatings = data.chrome_extension.number_of_ratings + data.edge_extension.number_of_ratings;
      let weightedAverageRating = totalRatingSum / totalRatings;
      weightedAverageRating = Math.round(weightedAverageRating * 10) / 10;

      // Display the star rating and average rating immediately
      const starRatingDiv = averageRatingSpan.querySelector('.star-rating');
      if(starRatingDiv) {
        displayStarRating(weightedAverageRating, starRatingDiv, averageRatingSpan);
      }

      // After data is fetched and target is set, set up the AOS event listener
      metricsSection.addEventListener('aos:in', () => {
        const target = +userCountElement.dataset.target; // Get the target number

        // Check if target is a valid number and animation hasn't run yet (textContent is still '0')
        if (!isNaN(target) && userCountElement.textContent === '0') {
          console.log("Metrics section AOS animation started. Starting counter animation.");
          animateCounter(userCountElement, target);
        }
      });

      // Also check if the element is already visible on page load and trigger animation
      const rect = metricsSection.getBoundingClientRect();
      const isVisibleInitially = (
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0
      );
      if (isVisibleInitially) {
           const target = +userCountElement.dataset.target; // Get the target number
           if (!isNaN(target) && userCountElement.textContent === '0') {
              console.log("Metrics section visible initially. Starting counter animation.");
              animateCounter(userCountElement, target);
           }
      }

    } catch (error) {
      console.error('Error fetching or parsing data from GitHub Pages:', error);
      userCountElement.textContent = 'Error loading data';
    }
  }

  // Initial data fetch when DOM is ready
  fetchAndPrepareMetrics().then(() => {
      // Initialize AOS after the initial data fetch (before potential animations)
      AOS.refresh();
  });
});
