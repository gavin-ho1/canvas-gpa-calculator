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

  // Function to fetch and display user count and rating
  async function fetchAndDisplayData() {
    const userCountElement = document.getElementById('user-count');
    const averageRatingSpan = document.getElementById('average-rating');
    const starRatingDiv = averageRatingSpan.querySelector('.star-rating');

    if (!userCountElement || !starRatingDiv) {
      console.warn("Elements with ID 'user-count' or 'average-rating' not found.");
      return;
    }

    try {
      const response = await fetch('https://raw.githubusercontent.com/gavin-ho1/canvas-gpa-calculator/website/docs/extension_data.json');
      if (!response.ok) {
        console.error(`Failed to fetch data from GitHub Pages: ${response.status}`);
        userCountElement.textContent = 'Error loading data';
        return;
      }
      const data = await response.json();

      console.log('Fetched data:', data); // Log the fetched data

      // Calculate total user count
      const totalUserCount = data.chrome_extension.users + data.edge_extension.users;
      const roundedUserCount = Math.floor(totalUserCount / 100) * 100;
      userCountElement.textContent = `${roundedUserCount}+`; // Display with locale formatting

      // Calculate weighted average rating
      const totalRatingSum = (data.chrome_extension.rating * data.chrome_extension.number_of_ratings) +
                            (data.edge_extension.rating * data.edge_extension.number_of_ratings);
      const totalRatings = data.chrome_extension.number_of_ratings + data.edge_extension.number_of_ratings;
      let weightedAverageRating = totalRatingSum / totalRatings;
      weightedAverageRating = Math.round(weightedAverageRating * 10) / 10;

      // Display the star rating and average rating
      displayStarRating(weightedAverageRating, starRatingDiv, averageRatingSpan);
    } catch (error) {
      console.error('Error fetching or parsing data from GitHub Pages:', error);
      userCountElement.textContent = 'Error loading data';
    }
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

  // Call the function to fetch and display the data
  fetchAndDisplayData();

  // Initialize AOS after displaying the star rating
  AOS.refresh();
});
