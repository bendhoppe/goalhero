function createEntry(entryType) {
    const entryBox = document.createElement("div");
    entryBox.classList.add("entry");

    // Title input with label
    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Title:";
    titleLabel.style.fontSize = "12px";
    titleLabel.style.fontWeight = "bold";
    titleLabel.style.marginBottom = "5px";
    const titleInput = document.createElement("input");
    titleInput.placeholder = "Enter habit title";
    titleInput.style.width = "100%";
    titleInput.style.marginBottom = "10px";

    // Description input with label
    const descLabel = document.createElement("label");
    descLabel.textContent = "Description:";
    descLabel.style.fontSize = "12px";
    descLabel.style.fontWeight = "bold";
    descLabel.style.marginBottom = "5px";
    const descInput = document.createElement("textarea");
    descInput.placeholder = "Enter habit description";
    descInput.style.width = "100%";
    descInput.style.marginBottom = "10px";

    // Goal dropdown with label
    const goalLabel = document.createElement("label");
    goalLabel.textContent = "What goal does this habit support?:";
    goalLabel.style.fontSize = "12px";
    goalLabel.style.fontWeight = "bold";
    goalLabel.style.marginBottom = "5px";
    const goalDropdown = document.createElement("select");
    const goals = ['Goal 1', 'Goal 2', 'Goal 3'];
    goals.forEach(goal => {
        const option = document.createElement("option");
        option.value = goal;
        option.textContent = goal;
        goalDropdown.appendChild(option);
    });
    goalDropdown.style.width = "100%";
    goalDropdown.style.marginBottom = "10px";
    goalDropdown.style.height = "30px";
    goalDropdown.style.fontSize = "14px";

    // Create checkboxes for each day of the week
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const checkboxesContainer = document.createElement("div");
    checkboxesContainer.style.display = "flex";
    checkboxesContainer.style.justifyContent = "center";
    checkboxesContainer.style.alignItems = "center";
    checkboxesContainer.style.marginTop = "10px";
    checkboxesContainer.style.width = "100%";
    checkboxesContainer.style.padding = "0 10px";
    checkboxesContainer.style.gap = "10px";

    const checkboxesState = {}; // Store the checkboxes' state

    // Loop through each day to create checkboxes
    daysOfWeek.forEach(day => {
        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.style.marginRight = "10px";
        checkboxWrapper.style.marginBottom = "10px";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `day-${day}`;
        checkbox.dataset.day = day;
        checkbox.style.display = "none"; // Initially hide the actual checkbox

        checkboxWrapper.style.display = "flex";
        checkboxWrapper.style.justifyContent = "center";
        checkboxWrapper.style.alignItems = "center";
        checkboxWrapper.style.width = "40px";
        checkboxWrapper.style.height = "40px";
        checkboxWrapper.style.borderRadius = "50%";
        checkboxWrapper.style.cursor = "pointer";
        checkboxWrapper.style.border = "2px solid #ddd";
        checkboxWrapper.style.transition = "background 0.3s, color 0.3s";

        const letter = document.createElement("span");
        letter.textContent = day;
        letter.style.color = "#aaa";
        letter.style.fontSize = "18px";
        letter.style.transition = "color 0.3s";

        checkboxWrapper.addEventListener("click", function() {
            checkbox.checked = !checkbox.checked;

            if (checkbox.checked) {
                letter.style.color = "white";
                checkboxWrapper.style.background = "linear-gradient(to bottom, #388BFF, #5ECFFF)";
                checkboxWrapper.style.border = "#388BFF";
            } else {
                letter.style.color = "#aaa";
                checkboxWrapper.style.background = "white";
                checkboxWrapper.style.border = "2px solid #ddd";
            }

            checkboxesState[day] = checkbox.checked; // Store checkbox state
        });

        checkboxWrapper.appendChild(letter);
        checkboxesContainer.appendChild(checkboxWrapper);
    });

    // Save and Cancel buttons
    const saveButton = document.createElement("button");
    saveButton.classList.add("save-button");
    saveButton.textContent = "Save";

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("cancel-button");
    cancelButton.textContent = "Cancel";

    // Entry content (title, description, goal, checkboxes) will be hidden during editing
    const entryContent = document.createElement("div");
    entryContent.style.display = "none"; // Initially hidden

    // Function to switch to saved state
    function saveEntry() {
        const title = titleInput.value;
        const description = descInput.value;
        const selectedGoal = goalDropdown.value;

        if (title && description) {
            // Clear the entry box content
            entryBox.innerHTML = "";

            // Add static content (title, description, checkboxes, goal)
            const titleElement = document.createElement("h4");
            titleElement.textContent = title;
            entryBox.appendChild(titleElement); // Add title to the box

            // Add checkboxes to saved entry
            const savedCheckboxesContainer = document.createElement("div");
            savedCheckboxesContainer.style.display = "flex";
            savedCheckboxesContainer.style.justifyContent = "center";
            savedCheckboxesContainer.style.alignItems = "center";
            savedCheckboxesContainer.style.marginTop = "10px";
            savedCheckboxesContainer.style.width = "100%";
            savedCheckboxesContainer.style.padding = "0 10px";
            savedCheckboxesContainer.style.gap = "10px";

            daysOfWeek.forEach(day => {
                const savedCheckboxWrapper = document.createElement("div");
                savedCheckboxWrapper.style.marginRight = "10px";
                savedCheckboxWrapper.style.marginBottom = "10px";

                const savedCheckbox = document.createElement("input");
                savedCheckbox.type = "checkbox";
                savedCheckbox.id = `saved-day-${day}`;
                savedCheckbox.checked = checkboxesState[day] || false; // Use the stored state for each checkbox

                savedCheckboxWrapper.style.display = "flex";
                savedCheckboxWrapper.style.justifyContent = "center";
                savedCheckboxWrapper.style.alignItems = "center";
                savedCheckboxWrapper.style.width = "40px";
                savedCheckboxWrapper.style.height = "40px";
                savedCheckboxWrapper.style.borderRadius = "50%";
                savedCheckboxWrapper.style.cursor = "pointer";
                savedCheckboxWrapper.style.border = "2px solid #ddd";
                savedCheckboxWrapper.style.transition = "background 0.3s, color 0.3s";

                const letter = document.createElement("span");
                letter.textContent = day;
                letter.style.color = savedCheckbox.checked ? "white" : "#aaa";
                letter.style.fontSize = "18px";
                letter.style.transition = "color 0.3s";

                if (savedCheckbox.checked) {
                    savedCheckboxWrapper.style.background = "linear-gradient(to bottom, #388BFF, #5ECFFF)";
                    savedCheckboxWrapper.style.border = "#388BFF";
                } else {
                    savedCheckboxWrapper.style.background = "white";
                    savedCheckboxWrapper.style.border = "2px solid #ddd";
                }

                savedCheckboxWrapper.appendChild(letter);
                savedCheckboxesContainer.appendChild(savedCheckboxWrapper);
            });

            entryBox.appendChild(savedCheckboxesContainer);

            // Add description and goal to saved entry
            const descriptionElement = document.createElement("p");
            descriptionElement.textContent = description;
            const goalElement = document.createElement("p");
            goalElement.textContent = `Goal: ${selectedGoal}`;

            entryBox.appendChild(descriptionElement);
            entryBox.appendChild(goalElement);

            // Add Edit and Delete buttons
            const editButton = document.createElement("button");
            editButton.classList.add("edit-button");
            editButton.textContent = "Edit";
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-button");
            deleteButton.textContent = "Delete";

            // Edit button functionality
            editButton.addEventListener("click", function() {
                entryBox.innerHTML = ""; // Clear the saved state
                entryBox.appendChild(titleInput);
                entryBox.appendChild(descInput);
                entryBox.appendChild(goalDropdown);
                entryBox.appendChild(saveButton); // Add save button
                entryBox.appendChild(cancelButton); // Add cancel button
                entryBox.appendChild(checkboxesContainer); // Add checkboxes container back
            });

            // Delete button functionality
            deleteButton.addEventListener("click", function() {
                entryBox.remove(); // Remove the entry from the DOM
            });

            entryBox.appendChild(editButton);
            entryBox.appendChild(deleteButton);
        }
    }

    // Cancel button functionality
    cancelButton.addEventListener("click", function() {
        entryBox.innerHTML = ""; // Clear the entry box
        entryBox.appendChild(titleInput);
        entryBox.appendChild(descInput);
        entryBox.appendChild(goalDropdown);
        entryBox.appendChild(saveButton);
        entryBox.appendChild(cancelButton);
    });

    // Save button event listener
    saveButton.addEventListener("click", saveEntry);

    // Initially show edit mode content
    entryBox.appendChild(titleInput);
    entryBox.appendChild(descInput);
    entryBox.appendChild(goalDropdown);
    entryBox.appendChild(saveButton);
    entryBox.appendChild(cancelButton);
    entryBox.appendChild(checkboxesContainer);

    return entryBox;
}






function createEntry(entryType) {
    const entryBox = document.createElement("div");
    entryBox.classList.add("entry");
    entryBox.style.position = "relative"; // For absolute positioning of buttons

    // Title input with label
    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Title:";
    titleLabel.style.fontSize = "12px";
    titleLabel.style.fontWeight = "bold";
    titleLabel.style.marginBottom = "5px";

    const titleInput = document.createElement("input");
    titleInput.placeholder = "Enter habit title";
    titleInput.style.width = "100%";
    titleInput.style.marginBottom = "10px";

    // Description input with label
    const descLabel = document.createElement("label");
    descLabel.textContent = "Description:";
    descLabel.style.fontSize = "12px";
    descLabel.style.fontWeight = "bold";
    descLabel.style.marginBottom = "5px";

    const descInput = document.createElement("textarea");
    descInput.placeholder = "Enter habit description";
    descInput.style.width = "100%";
    descInput.style.marginBottom = "10px";

    // Goal dropdown with label
    const goalLabel = document.createElement("label");
    goalLabel.textContent = "What goal does this habit support?:";
    goalLabel.style.fontSize = "12px";
    goalLabel.style.fontWeight = "bold";
    goalLabel.style.marginBottom = "5px";

    const goalDropdown = document.createElement("select");
    const goals = ['Goal 1', 'Goal 2', 'Goal 3'];
    goals.forEach(goal => {
        const option = document.createElement("option");
        option.value = goal;
        option.textContent = goal;
        goalDropdown.appendChild(option);
    });
    goalDropdown.style.width = "100%";
    goalDropdown.style.marginBottom = "10px";
    goalDropdown.style.height = "30px";

    // Save and Cancel buttons
    const saveButton = document.createElement("button");
    saveButton.classList.add("save-button");
    saveButton.textContent = "Save";

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("cancel-button");
    cancelButton.textContent = "Cancel";

    // Edit and Delete buttons
    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.innerHTML = "✎"; // Pencil icon

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = "🗑️"; // Trash bin icon

    // Style buttons to be small icons in the upper-right corner
    editButton.style.position = "absolute";
    editButton.style.top = "10px";
    editButton.style.right = "10px";
    editButton.style.fontSize = "16px";
    editButton.style.background = "none";
    editButton.style.border = "none";
    editButton.style.cursor = "pointer";
    editButton.style.color = "#555";

    deleteButton.style.position = "absolute";
    deleteButton.style.top = "10px";
    deleteButton.style.right = "30px";
    deleteButton.style.fontSize = "16px";
    deleteButton.style.background = "none";
    deleteButton.style.border = "none";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.color = "#d9534f";

    // Create checkboxes for each day of the week (S, M, T, W, T, F, S)
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Abbreviations for each day of the week
    const checkboxesContainer = document.createElement("div");
    checkboxesContainer.style.display = "none"; // Initially hide the checkboxes container
    checkboxesContainer.style.display = "flex";
    checkboxesContainer.style.justifyContent = "center"; // Center the checkboxes horizontally
    checkboxesContainer.style.alignItems = "center"; // Center the checkboxes vertically
    checkboxesContainer.style.marginTop = "10px";
    checkboxesContainer.style.width = "100%"; // Ensure it takes full width of the parent container
    checkboxesContainer.style.padding = "0 10px"; // Add some padding to avoid touching the edges
    checkboxesContainer.style.gap = "10px"; // Adds some space between the checkboxes

    daysOfWeek.forEach(day => {
        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.style.marginRight = "10px";
        checkboxWrapper.style.marginBottom = "10px";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `day-${day}`;
        checkbox.dataset.day = day; // Store the day for styling
        checkbox.style.display = "none"; // Hide the actual checkbox

        // Style the checkbox to look like a large circle
        checkboxWrapper.style.display = "flex";
        checkboxWrapper.style.justifyContent = "center";
        checkboxWrapper.style.alignItems = "center";
        checkboxWrapper.style.width = "40px"; // Size of the circle (40px)
        checkboxWrapper.style.height = "40px"; // Height of the circle (40px)
        checkboxWrapper.style.borderRadius = "50%"; // Make it circular
        checkboxWrapper.style.cursor = "pointer";
        checkboxWrapper.style.border = "2px solid #ddd"; // Light border for inactive state
        checkboxWrapper.style.transition = "background 0.3s, color 0.3s"; // Smooth transitions

        const letter = document.createElement("span");
        letter.textContent = day;
        letter.style.color = "#aaa"; // Default grey color when unchecked
        letter.style.fontSize = "18px";
        letter.style.transition = "color 0.3s"; // Smooth transition when checked/unchecked

        // Toggle checkbox and circle appearance on click
        checkboxWrapper.addEventListener("click", function() {
            checkbox.checked = !checkbox.checked; // Toggle checkbox state

            if (checkbox.checked) {
                letter.style.color = "white"; // Change letter to white when checked
                checkboxWrapper.style.background = "linear-gradient(to bottom, #388BFF, #5ECFFF)"; // Blue gradient when checked
                checkboxWrapper.style.border = "#388BFF"; // Set the border to blue when checked
            } else {
                letter.style.color = "#aaa"; // Change letter back to grey when unchecked
                checkboxWrapper.style.background = "white"; // White background when unchecked
                checkboxWrapper.style.border = "2px solid #ddd"; // Revert border to grey when unchecked
            }
        });

        checkboxWrapper.appendChild(letter);
        checkboxesContainer.appendChild(checkboxWrapper);
    });

    // Save Button Logic
    saveButton.addEventListener("click", function() {
        const title = titleInput.value;
        const description = descInput.value;
        const selectedGoal = goalDropdown.value;

        if (title && description) {
            // Save the data and display the static content
            entryBox.innerHTML = ""; // Clear existing content

            // Create and display static content (title, description, goal)
            const titleElement = document.createElement("h4");
            titleElement.textContent = title;
            entryBox.appendChild(titleElement);

            const descriptionElement = document.createElement("p");
            descriptionElement.textContent = description;
            const goalElement = document.createElement("p");
            goalElement.textContent = `Goal: ${selectedGoal}`;

            entryBox.appendChild(descriptionElement);
            entryBox.appendChild(goalElement);

            // Show the checkboxes container after saving
            entryBox.appendChild(checkboxesContainer);
            checkboxesContainer.style.display = "flex";

            // Re-attach the Edit and Delete buttons
            entryBox.appendChild(editButton);
            entryBox.appendChild(deleteButton);
        }
    });

    // Cancel Button Logic (Reverts to saved state)
    cancelButton.addEventListener("click", function() {
        // Simply revert the form back to saved content without deleting the entire entry
        const titleElement = entryBox.querySelector("h4");
        const descriptionElement = entryBox.querySelector("p");
        const goalElement = entryBox.querySelectorAll("p")[1];

        if (titleElement && descriptionElement && goalElement) {
            entryBox.innerHTML = ""; // Clear temporary inputs and content

            // Re-add the saved content
            entryBox.appendChild(titleElement);
            entryBox.appendChild(descriptionElement);
            entryBox.appendChild(goalElement);

            // Re-add the Edit and Delete buttons
            entryBox.appendChild(editButton);
            entryBox.appendChild(deleteButton);

            // Show the checkboxes again
            entryBox.appendChild(checkboxesContainer);
            checkboxesContainer.style.display = "flex"; // Show checkboxes
        }
    });

    // Edit Button Logic (Replaces static content with editable fields)
    editButton.addEventListener("click", function() {
        // Replace static content with inputs for editing
        entryBox.innerHTML = ""; // Clear current content

        entryBox.appendChild(titleLabel);
        entryBox.appendChild(titleInput);
        entryBox.appendChild(descLabel);
        entryBox.appendChild(descInput);
        entryBox.appendChild(goalLabel);
        entryBox.appendChild(goalDropdown);
        entryBox.appendChild(saveButton);
        entryBox.appendChild(cancelButton);
    });

    // Delete Button Logic
    deleteButton.addEventListener("click", function() {
        if (confirm("Are you sure you want to delete this entry?")) {
            entryBox.remove(); // Remove the entry box if confirmed
        }
    });

    // Initially, add input elements (title, description, goal, buttons)
    entryBox.appendChild(titleLabel);
    entryBox.appendChild(titleInput);
    entryBox.appendChild(descLabel);
    entryBox.appendChild(descInput);
    entryBox.appendChild(goalLabel);
    entryBox.appendChild(goalDropdown);
    entryBox.appendChild(saveButton);
    entryBox.appendChild(cancelButton);

    // Append the entry box to the corresponding container
    const containerId = entryType === 'habit' ? 'habitEntries' : 'goalEntries';
    document.getElementById(containerId).appendChild(entryBox);
}

// Habit Entry Logic
document.getElementById("addHabitBtn").addEventListener("click", function() {
    createEntry('habit');
});
