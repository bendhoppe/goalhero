document.addEventListener("DOMContentLoaded", function() {
    // Register Button functionality
    document.getElementById("registerBtn").addEventListener("click", function() {
        const username = document.getElementById("usernameInput").value;
        const password = document.getElementById("passwordInput").value;

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
                alert(data.message); // Registration success message
                // Optionally redirect to login page
                // window.location.href = "login.html";
            } else {
                alert('Registration failed: ' + data.error);
            }
        })
        .catch(error => console.error('Error during registration:', error));
    });

     // Login Button functionality
     document.addEventListener("DOMContentLoaded", () => {
        const loginBtn = document.getElementById("loginBtn");

        loginBtn.addEventListener("click", async (e) => {
            e.preventDefault();  // Prevent default form submission

            // Collect input values
            const username = document.getElementById("loginUsernameInput").value;
            const password = document.getElementById("loginPasswordInput").value;

            // Basic validation
            if (!username || !password) {
                alert("Please fill in both fields.");
                return;
            }

            // Prepare login data
            const loginData = {
                username: username, // Assuming you're using 'username' for login
                password: password,
            };

            try {
                // Send login request to the backend
                const response = await fetch("/api/users/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(loginData),
                });

                // Handle the response
                const result = await response.json();

                if (response.ok) {
                    alert(result.message); // Show success message
                    // Optionally store the token in localStorage or cookies
                    localStorage.setItem("authToken", result.token);
                    // Redirect to the dashboard or another page
                    window.location.href = "dashboard.html";
                } else {
                    alert(result.message || "Login failed"); // Show error message
                }
            } catch (error) {
                console.error("Error during login:", error);
                alert("An error occurred. Please try again.");
            }
        });
    });
    // Entry Button functionality (already in your original script)
    document.getElementById("addEntryBtn").addEventListener("click", function() {
        const entryBox = document.createElement("div");
        entryBox.classList.add("entry");

        const titleInput = document.createElement("input");
        titleInput.placeholder = "Enter title";
        titleInput.style.width = "100%";
        titleInput.style.marginBottom = "10px";

        const descInput = document.createElement("textarea");
        descInput.placeholder = "Enter description";
        descInput.style.width = "100%";
        descInput.style.marginBottom = "10px";

        const saveButton = document.createElement("button");
        saveButton.classList.add("save-button");
        saveButton.textContent = "Save";

        const cancelButton = document.createElement("button");
        cancelButton.classList.add("cancel-button");
        cancelButton.textContent = "Cancel"; // Add Cancel button

        const entryContent = document.createElement("div");
        entryContent.style.display = "none";

        // Save button functionality
        saveButton.addEventListener("click", function() {
            const title = titleInput.value;
            const description = descInput.value;

            if (title && description) {
                const titleElement = document.createElement("h4");
                titleElement.textContent = title;
                const descElement = document.createElement("p");
                descElement.textContent = description;

                entryContent.innerHTML = ""; // Clear previous content
                entryContent.appendChild(titleElement);
                entryContent.appendChild(descElement);
                entryContent.style.display = "block"; // Show entry content

                // Replace inputs with entry content
                entryBox.innerHTML = "";
                entryBox.appendChild(entryContent);

                // Add edit and delete buttons
                const editButton = document.createElement("button");
                editButton.classList.add("edit-button");
                editButton.textContent = "Edit";

                const deleteButton = document.createElement("button");
                deleteButton.classList.add("delete-button");
                deleteButton.textContent = "Delete";

                editButton.addEventListener("click", function() {
                    entryBox.innerHTML = ""; // Clear entry box
                    entryBox.appendChild(titleInput);
                    entryBox.appendChild(descInput);
                    entryBox.appendChild(saveButton); // Add save button back
                });

                deleteButton.addEventListener("click", function() {
                    if (confirm("Are you sure you want to delete this entry?")) {
                        entryBox.remove(); // Remove the entry box if confirmed
                    }
                });

                entryBox.appendChild(editButton);
                entryBox.appendChild(deleteButton);
            }
        });

        // Cancel button functionality
        cancelButton.addEventListener("click", function() {
            entryBox.remove(); // Remove the entry box
        });

        entryBox.appendChild(titleInput);
        entryBox.appendChild(descInput);
        entryBox.appendChild(saveButton);
        entryBox.appendChild(cancelButton); // Add the cancel button to the entry box
        entryBox.appendChild(entryContent);

        document.getElementById("futureEntries").appendChild(entryBox);
    });
});
