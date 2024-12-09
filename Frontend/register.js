document.getElementById("registerBtn").addEventListener("click", function () {
    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;
    const messageContainer = document.getElementById("messageContainer");

    // Register the user
    fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                // Display success message in the UI
                messageContainer.innerHTML = `<p style="color: green;">${data.message}</p>`;

                // Automatically log in the user
                return fetch('/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
            } else {
                // Display error message if registration fails
                messageContainer.innerHTML = `<p style="color: red;">Registration failed: ${data.error}</p>`;
                throw new Error(data.error || 'Unknown registration error');
            }
        })
        .then(response => response.json())
        .then(loginData => {
            if (loginData.token) {
                // Save the token in localStorage
                localStorage.setItem("authToken", loginData.token);

                // Redirect to the future journaling page after a short delay
                setTimeout(() => {
                    window.location.href = "future_journaling.html";
                }, 1000); // Redirect after 2 seconds to show the success message
            } else {
                // Handle login failure
                messageContainer.innerHTML = `<p style="color: red;">Login failed: ${loginData.error}</p>`;
            }
        })
        .catch(error => {
            console.error('Error during registration or login:', error);
            messageContainer.innerHTML = `<p style="color: red;">An error occurred: ${error.message}</p>`;
        });
});
