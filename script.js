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

  // Function to fetch and display Chrome user count
  async function fetchChromeUserCount() {
    const userCountElement = document.getElementById('chrome-user-count');
    if (!userCountElement) {
      console.warn("Element with ID 'chrome-user-count' not found.");
      return;
    }

    try {
      const response = await fetch('chrome-user-count.json');
      if (!response.ok) {
        console.error(`Failed to fetch chrome-user-count.json: ${response.status}`);
        userCountElement.textContent = 'Error loading count';
        return;
      }
      const data = await response.json();
      if (data && data.chromeUserCount !== undefined) {
        userCountElement.textContent = data.chromeUserCount.toLocaleString(); // Display with locale formatting
      } else {
        userCountElement.textContent = 'Count not available';
      }
    } catch (error) {
      console.error('Error fetching or parsing chrome-user-count.json:', error);
      userCountElement.textContent = 'Error loading count';
    }
  }

  // Call the function to fetch and display the count
  fetchChromeUserCount();
});