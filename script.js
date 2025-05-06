document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS
  AOS.init({
    once: true // animations will only run once on scroll down
  });

  // Sidebar toggle functionality
  const toggleBtn = document.querySelector('.toggle-btn');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');

  if (toggleBtn && sidebar && mainContent) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-open'); // Toggle class on body
    });
  }

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

  // Function to fetch and set the target for the counter and display rating
  async function fetchAndPrepareMetrics() { // Renamed function
    const userCountElement = document.getElementById('user-count');
    const averageRatingSpan = document.getElementById('average-rating');
    // Note: starRatingDiv is now selected inside displayStarRating if needed

    if (!userCountElement || !averageRatingSpan) { // Adjusted check
      console.warn("Elements with ID 'user-count' or 'average-rating' not found.");
      return;
    }

    try {
      const response = await fetch('https://raw.githubusercontent.com/gavin-ho1/canvas-gpa-calculator/website/docs/extension_data.json');
      if (!response.ok) {
        console.error(`Failed to fetch data from GitHub Pages: ${response.status}`);
        userCountElement.textContent = 'Error loading data'; // Keep error display
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
      const starRatingDiv = averageRatingSpan.querySelector('.star-rating'); // Select here
      if(starRatingDiv) {
        displayStarRating(weightedAverageRating, starRatingDiv, averageRatingSpan);
      }

    } catch (error) {
      console.error('Error fetching or parsing data from GitHub Pages:', error);
      userCountElement.textContent = 'Error loading data'; // Keep error display
    }
  }

  // Animation function for the counter
  function animateCounter(element, target) {
    const start = 0;
    const duration = 1000; // Animation duration in milliseconds (1 second for quick animation)
    let startTime = null;

    function updateCounter(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const current = Math.min(Math.floor((progress / duration) * target), target);
      element.textContent = `${current}+`;

      if (progress < duration) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = `${target}+`; // Ensure it ends exactly at the target
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // Intersection Observer to trigger the counter animation
  const metricsSection = document.querySelector('.metrics-container');

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const userCountElement = document.getElementById('user-count');
        const target = +userCountElement.dataset.target; // Get the target number

        if (!isNaN(target)) {
            animateCounter(userCountElement, target);
        }

        // Stop observing once the animation is triggered
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5 // Trigger when 50% of the element is visible
  });

  // Start observing the metrics section
  if (metricsSection) {
    observer.observe(metricsSection);
  }

  // Initial data fetch when DOM is ready
  fetchAndPrepareMetrics(); // Call the renamed function

  // Initialize AOS after the initial data fetch (before potential animations)
  AOS.refresh();
});
