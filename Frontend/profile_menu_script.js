  <script>
    // Handle dropdown menu toggle
    let isDropdownOpen = false;

    document.getElementById("profileButton").onclick = function(event) {
        const dropdownMenu1 = document.getElementById("dropdownMenu1");
        const dropdownMenu2 = document.getElementById("dropdownMenu2");

        // Toggle between displaying the dropdown menus
        if (isDropdownOpen) {
            dropdownMenu1.style.display = "none";
            dropdownMenu2.style.display = "none";
        } else {
            dropdownMenu1.style.display = "none"; // Hide login/signup dropdown
            dropdownMenu2.style.display = "block"; // Show logout dropdown
        }

        isDropdownOpen = !isDropdownOpen;
        event.stopPropagation(); // Prevents triggering the window click listener
    };

    // Close the dropdown if clicked outside
    window.onclick = function(event) {
        const dropdownMenu1 = document.getElementById("dropdownMenu1");
        const dropdownMenu2 = document.getElementById("dropdownMenu2");

        if (!event.target.closest(".top-bar.profile-icon") && !event.target.closest("#profileButton")) {
            dropdownMenu1.style.display = "none";
            dropdownMenu2.style.display = "none";
            isDropdownOpen = false;
        }
    };

    // Handle logout button visibility
    function checkUserLoggedIn() {
        const token = localStorage.getItem("authToken");

        if (token) {
            // User is logged in, show logout button
            document.getElementById("dropdownMenu2").style.display = "block";
        } else {
            // User is not logged in, show login/signup menu
            document.getElementById("dropdownMenu1").style.display = "block";
        }
    }

    // Logout functionality
    document.getElementById("logoutBtn").addEventListener("click", function() {
        // Remove the authentication token from localStorage
        localStorage.removeItem("authToken");

        // Redirect to login page after logout
        window.location.href = "login.html";
    });

    // Check if the user is logged in when the page loads
    checkUserLoggedIn();
  </script>