document.getElementById("loginBtn").addEventListener("click", function (event) {
    event.preventDefault();  // Prevent form submission

    const username = document.getElementById("loginUsernameInput").value;
    const password = document.getElementById("loginPasswordInput").value;

    loginUser(username, password);
});

function loginUser(username, password) {
    const messageContainer = document.getElementById("authContainer");

    // Send login request to the backend
    fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                // Save token in localStorage
                localStorage.setItem("authToken", data.token);
                // Display success message
                const successMessage = document.createElement("p");
                successMessage.style.color = "green";
                successMessage.textContent = "Login successful! Redirecting...";
                messageContainer.appendChild(successMessage);

                // Redirect to the future journaling page
                setTimeout(() => {
                    window.location.href = "future_journaling.html";
                }, 2000);
            } else {
                // Display error message
                const errorMessage = document.createElement("p");
                errorMessage.style.color = "red";
                errorMessage.textContent = `Login failed: ${data.error}`;
                messageContainer.appendChild(errorMessage);
            }
        })
        .catch(err => {
            console.error("Login error: ", err);
        });
}

// Check if user is logged in and show the correct menu
function checkUserLoggedIn() {
    const token = localStorage.getItem("authToken");

    if (token) {
        document.getElementById("dropdownMenu1").style.display = "none";
        document.getElementById("dropdownMenu2").style.display = "block";
    } else {
        document.getElementById("dropdownMenu1").style.display = "block";
        document.getElementById("dropdownMenu2").style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", checkUserLoggedIn);
