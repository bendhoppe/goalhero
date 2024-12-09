const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'TUE', 'FRI', 'SAT']; // Global days of week
// Initialize variables
const backArrow = document.getElementById("back-arrow");
const forwardArrow = document.getElementById("forward-arrow");
const todayButton = document.getElementById("today-button");
const weekDisplay = document.getElementById("week-display");

let currentWeek = new Date(); // Today's date
let displayedWeek = new Date(); // Initially set to today's week

// Helper function to get start and end dates of a week
function getWeekRange(date) {
    // Ensure date is in UTC to prevent time zone issues
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - date.getUTCDay()));

    // Set the time to midnight UTC for the start of the week
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6); // End of the week (Saturday)
    end.setUTCHours(23, 59, 59, 999); // Set to the end of the day UTC for the end date

    console.log("Start of week:", start.toISOString());  // Debugging log
    console.log("End of week:", end.toISOString());  // Debugging log

    return {
        start: start.toISOString().split('T')[0], // Use ISO string format to avoid time zone issues
        end: end.toISOString().split('T')[0], // Use ISO string format
    };
}



// Update the display
function updateWeekDisplay() {
    const { start, end } = getWeekRange(displayedWeek);
    weekDisplay.textContent = `Week of ${start.split('-').slice(1).join('-')} - ${end.split('-').slice(1).join('-')}`;

    // Enable/disable the forward button based on the current displayed week
    forwardArrow.disabled = displayedWeek.toISOString().split('T')[0] === getWeekRange(currentWeek).start;

    // Fetch and render habits for the displayed week
    fetchHabitsForWeek();
}

// Event listeners
backArrow.addEventListener("click", () => {
  displayedWeek.setDate(displayedWeek.getDate() - 7);
  updateWeekDisplay();
});

forwardArrow.addEventListener("click", () => {
  if (!forwardArrow.disabled) {
    displayedWeek.setDate(displayedWeek.getDate() + 7);
    updateWeekDisplay();
  }
});

todayButton.addEventListener("click", () => {
    displayedWeek = new Date(currentWeek); // Reset to today's week
    console.log("Reset to current week:", displayedWeek);  // Debugging log
    updateWeekDisplay();
});



// Initialize display
updateWeekDisplay();

function createEntry(entryType, habit = null) {
    const entryBox = document.createElement("div");
    entryBox.classList.add("entry");
    entryBox.style.position = "relative";

    entryBox.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.2)";
    entryBox.style.paddingTop = "40px";
    entryBox.style.borderRadius = "10px";
    entryBox.style.marginBottom = "20px";
    entryBox.style.transition = "box-shadow 0.3s ease, background 0.3s ease";

    // Input fields (title, description, etc.)
    const titleLabel = createLabel("Title:", "12px", "bold", "5px");
    const titleInput = createInput("Enter habit title", habit ? habit.title : "");

    const descLabel = createLabel("Description:", "12px", "bold", "5px");
    const descInput = createTextArea("Enter habit description", habit ? habit.description : "");

    const goalLabel = createLabel("What goal does this habit support?:", "12px", "bold", "5px");
    const goalDropdown = document.createElement("select");
    goalDropdown.style.width = "100%";
    goalDropdown.style.marginBottom = "10px";

    fetch("/api/goals", {
    headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`, // Add token
    },
})
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Failed to fetch goals: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then((goals) => {
        console.log("Fetched goals:", goals); // Debugging log
        goals.forEach((goal) => {
            const option = document.createElement("option");
            option.value = goal.id; // Use the unique goal ID
            option.textContent = goal.title; // Display the goal title
            goalDropdown.appendChild(option);
        });

        // If editing a habit, select the associated goal
        if (habit && habit.goal_id) {
            goalDropdown.value = habit.goal_id;
        }
    })
    .catch((error) => {
        console.error("Error fetching goals:", error);
        alert("Failed to load goals for the dropdown.");
    });

    const whenLabel = createLabel("When will you perform this habit?", "12px", "bold", "5px");
    const whenInput = createInput("Enter time or frequency", habit ? habit.when_to_perform : "");

    const obstacleLabel = createLabel("What is one potential obstacle to this habit?", "12px", "bold", "5px");
    const obstacleInput = createTextArea("Describe one potential obstacle", habit ? habit.obstacle : "");

    const overcomeLabel = createLabel("How will you overcome this obstacle?", "12px", "bold", "5px");
    const overcomeInput = createTextArea("Describe your plan to overcome this obstacle", habit ? habit.plan_to_overcome : "");

    // Checkboxes for each day of the week (S, M, T, W, T, F, S)
    const checkboxesContainer = createCheckboxes(habit ? habit.week_status : 0);

    // Buttons (Save, Cancel)
    const saveButton = createButton("Save", "save-button");
    const cancelButton = createButton("Cancel", "cancel-button");


// Inside saveButton event listener
// Save the checkbox state after habit creation
saveButton.addEventListener("click", function () {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const selectedGoal = goalDropdown.value;
    const when = whenInput.value.trim();
    const obstacle = obstacleInput.value.trim();
    const overcome = overcomeInput.value.trim();
    const weekData = {};

    // Collect checkbox data for the week
    daysOfWeek.forEach((day) => {
        const checkbox = document.getElementById(`day-${day}`);
        weekData[day] = checkbox && checkbox.checked ? 1 : 0; // Default to 0 if checkbox not found
    });

    if (!title || !description || !selectedGoal) {
        alert("Title, description, and goal are required.");
        return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("No token provided");
        return;
    }

    fetch("/api/habits", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            title,
            description,
            goal_id: selectedGoal,
            when,
            obstacle,
            overcome,
            week_status: weekData, // Send week data along with habit creation
        }),
    })
        .then((response) => {
            if (!response.ok) {
                console.error('API Response Error:', response.status, response.statusText);
                return Promise.reject('Failed to save habit');
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                const habitId = data.habitId;
                entryBox.dataset.id = habitId;
                entryBox.innerHTML = `
                    <h4>${title}</h4>
                    <p>${description}</p>
                `;

                // Dynamically add labels and inputs with styling
                const addLabeledField = (labelText, value) => {
                    const label = document.createElement("div");
                    label.textContent = labelText;
                    label.style.fontSize = "12px";
                    label.style.fontWeight = "bold";
                    label.style.marginBottom = "5px";

                    const valueElement = document.createElement("p");
                    valueElement.textContent = value;

                    entryBox.appendChild(label);
                    entryBox.appendChild(valueElement);
                };

                addLabeledField("What goal does this habit support?", goalDropdown.options[goalDropdown.selectedIndex].text);
                addLabeledField("When will you complete this goal?", when);
                addLabeledField("What is one possible obstacle to this habit?", obstacle);
                addLabeledField("How will you overcome this obstacle?", overcome);

                entryBox.appendChild(checkboxesContainer);

                // Immediately save the checkbox state after habit creation
                const weekStart = getCurrentWeekStart(); // Assuming current week is selected
                saveCheckboxState(habitId, weekStart, weekData);
            } else {
                console.error("API Error: ", data.message || "Unknown error");
                alert("Failed to save habit.");
            }
        })
        .catch((error) => {
            console.error("Error saving habit:", error);
            alert("Failed to save habit.");
        });
});



    cancelButton.addEventListener("click", () => entryBox.remove());

    // Append elements to entry box
    appendToEntryBox(entryBox, [
        titleLabel,
        titleInput,
        descLabel,
        descInput,
        goalLabel,
        goalDropdown,
        whenLabel,
        whenInput,
        obstacleLabel,
        obstacleInput,
        overcomeLabel,
        overcomeInput,
        saveButton,
        cancelButton,
    ]);

// Initialize the current week
let displayedWeek = new Date(); // Start with the current week


// Call updateWeekDisplay on page load to set the initial week display


    const containerId = entryType === "habit" ? "habitEntries" : "goalEntries";
    document.getElementById(containerId).appendChild(entryBox);
}

// Helper Functions for Creating Elements
function createLabel(text, fontSize, fontWeight, marginBottom) {
    const label = document.createElement("label");
    label.textContent = text;
    label.style.fontSize = fontSize;
    label.style.fontWeight = fontWeight;
    label.style.marginBottom = marginBottom;
    return label;
}

function createInput(placeholder, value = "") {
    const input = document.createElement("input");
    input.placeholder = placeholder;
    input.value = value;
    input.style.width = "100%";
    input.style.marginBottom = "10px";
    return input;
}

function createTextArea(placeholder, value = "") {
    const textarea = document.createElement("textarea");
    textarea.placeholder = placeholder;
    textarea.value = value;
    textarea.style.width = "100%";
    textarea.style.marginBottom = "10px";
    return textarea;
}

function createDropdown(options, selectedValue = "") {
    const dropdown = document.createElement("select");
    options.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        if (option === selectedValue) opt.selected = true;
        dropdown.appendChild(opt);
    });
    dropdown.style.width = "100%";
    dropdown.style.marginBottom = "10px";
    return dropdown;
}

function createButton(text, className) {
    const button = document.createElement("button");
    button.classList.add(className);
    button.textContent = text;
    return button;
}

function createIconButton(src, className, altText) {
    const button = document.createElement("button");
    button.classList.add(className);
    const img = document.createElement("img");
    img.src = src;
    img.alt = altText;
    img.style.width = "30px";
    img.style.height = "30px";
    button.appendChild(img);
    return button;
}

function appendToEntryBox(entryBox, elements) {
    elements.forEach((el) => entryBox.appendChild(el));
}

// Habit Entry Logic
document.getElementById("addHabitBtn").addEventListener("click", () => createEntry("habit"));

window.onload = function () {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please log in to view your habits.');
        return;
    }

    fetch('/api/habits', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch habits');
            }
            return response.json();
        })
        .then(habits => {
            console.log('Fetched habits:', habits);
            habits.forEach(habit => displayHabit(habit));
        })
        .catch(error => {
            console.error('Error fetching habits:', error.message);
            alert('Failed to load habits.');
        });
};

function displayHabit(habit) {
    const entryBox = document.createElement("div");
    entryBox.classList.add("entry");
    entryBox.dataset.id = habit.id;
    entryBox.style.position = 'relative';

    entryBox.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.2)";
    entryBox.style.paddingTop = "40px";
    entryBox.style.borderRadius = "10px";
    entryBox.style.marginBottom = "20px";
    entryBox.style.transition = "box-shadow 0.3s ease, background 0.3s ease";

    const titleElement = document.createElement("h4");
    titleElement.textContent = habit.title;

    const descElement = document.createElement("p");
    descElement.textContent = habit.description;

    // Fetch the goal title based on the goal_id
    const goalElement = document.createElement("p");
    fetch(`/api/goals/${habit.goal_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
    .then(response => response.json())
    .then(goalData => {
        goalElement.textContent = `${goalData.title}`;  // Display the goal's title
    })
    .catch((error) => {
        console.error("Error fetching goal data:", error);
        goalElement.textContent = "Goal data not available";
    });

    const whenElement = document.createElement("p");
    whenElement.textContent = `${habit.when_to_perform}`;

    const obstacleElement = document.createElement("p");
    obstacleElement.textContent = `${habit.obstacle}`;

    const overcomeElement = document.createElement("p");
    overcomeElement.textContent = `${habit.plan_to_overcome}`;

    // Function to create a label and corresponding text
    const createLabel = (text) => {
        const label = document.createElement("label");
        label.textContent = text;
        label.style.fontSize = "14px";  // Smaller font size
        label.style.fontWeight = "bold"; // Bold
        label.style.marginBottom = "5px"; // Space between label and input
        return label;
    };

    // Create labels for each section and append them with the inputs
    const goalLabel = createLabel("What goal does this habit support?");
    const whenLabel = createLabel("When will you complete this habit?");
    const obstacleLabel = createLabel("What is one possible obstacle to this habit?");
    const overcomeLabel = createLabel("What is your plan for overcoming this obstacle?");

    // Append habit details to entryBox
    entryBox.appendChild(titleElement);
    entryBox.appendChild(descElement);

    entryBox.appendChild(goalLabel);
    entryBox.appendChild(goalElement);

    entryBox.appendChild(whenLabel);
    entryBox.appendChild(whenElement);

    entryBox.appendChild(obstacleLabel);
    entryBox.appendChild(obstacleElement);

    entryBox.appendChild(overcomeLabel);
    entryBox.appendChild(overcomeElement);

    // Fetch weekly checkbox data
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
    fetch(`/api/habits/${habit.id}/weeks/${startOfWeek}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    })
        .then((response) => response.json())
        .then((weekData) => {
            const checkboxesContainer = createCheckboxes(weekData, habit.id); // Pass the week data to create checkboxes
            entryBox.appendChild(checkboxesContainer); // Append the checkboxes to the habit entry
        })
        .catch((error) => console.error("Error fetching week data:", error));

    // Create and append edit and delete buttons
    entryBox.appendChild(createEditButton(entryBox, habit.id));
    entryBox.appendChild(createDeleteButton(entryBox, habit.id));

    // Append the habit entry to the page
    document.getElementById("habitEntries").appendChild(entryBox);
}


function createEditButton(entryBox, habitId) {
    console.log('Creating edit button for habit ID:', habitId); // Debugging log

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");

    // Edit button icon
    const editIcon = document.createElement("img");
    editIcon.src = "EditIcon.png"; // Path to your edit icon image
    editIcon.alt = "Edit Icon"; // Alternative text
    editIcon.style.width = "30px";
    editIcon.style.height = "30px";

    editButton.appendChild(editIcon);

    // Style the edit button
    editButton.style.position = "absolute";
    editButton.style.top = "10px";
    editButton.style.right = "10px";
    editButton.style.fontSize = "16px";
    editButton.style.background = "none";
    editButton.style.border = "none";
    editButton.style.cursor = "pointer";
    editButton.style.color = "#555";

editButton.addEventListener("click", function () {
    console.log('Edit button clicked for habit ID:', habitId); // Debugging log

    // Extract current values from the entryBox
    const titleText = entryBox.querySelector("h4").textContent;
    const descriptionText = entryBox.querySelector("p:nth-of-type(1)").textContent.replace('Description: ', '');
    const goalText = entryBox.querySelector("p:nth-of-type(2)").textContent.replace('Goal: ', '');
    const whenText = entryBox.querySelector("p:nth-of-type(3)").textContent.replace('When: ', '');
    const obstacleText = entryBox.querySelector("p:nth-of-type(4)").textContent.replace('Obstacle: ', '');
    const overcomeText = entryBox.querySelector("p:nth-of-type(5)").textContent.replace('Plan: ', '');

    // Create inputs for editing
    const titleInput = createInput("Enter habit title");
    titleInput.value = titleText;

    const descInput = createTextArea("Enter habit description");
    descInput.value = descriptionText;

    const goalInput = createInput("Enter associated goal");
    goalInput.value = goalText;

    const whenInput = createInput("Enter when to perform");
    whenInput.value = whenText;

    const obstacleInput = createTextArea("Describe one potential obstacle");
    obstacleInput.value = obstacleText;

    const overcomeInput = createTextArea("Describe your plan to overcome this obstacle");
    overcomeInput.value = overcomeText;

    const saveButton = createButton("Save", "save-button");
    const cancelButton = createButton("Cancel", "cancel-button");

    // Replace content with edit mode inputs
    entryBox.innerHTML = "";
    entryBox.appendChild(titleInput);
    entryBox.appendChild(descInput);
    entryBox.appendChild(goalInput);
    entryBox.appendChild(whenInput);
    entryBox.appendChild(obstacleInput);
    entryBox.appendChild(overcomeInput);
    entryBox.appendChild(saveButton);
    entryBox.appendChild(cancelButton);

    // Save button functionality
    saveButton.addEventListener("click", function () {
        console.log('Saving updated habit for ID:', habitId); // Debugging log

        fetch(`/api/habits/${habitId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({
                title: titleInput.value.trim(),
                description: descInput.value.trim(),
                goal_id: goalInput.value.trim(),
                when_to_perform: whenInput.value.trim(),
                obstacle: obstacleInput.value.trim(),
                plan_to_overcome: overcomeInput.value.trim(),
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log('Habit updated successfully:', data);

                    // Fetch current week's checkboxes from the backend
                    const weekStart = getCurrentWeekStart();
                    fetch(`/api/habits/${habitId}/weeks/${weekStart}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
                    })
                        .then((response) => response.json())
                        .then((weekData) => {
                            // Switch back to display mode with checkboxes
                            entryBox.innerHTML = `
                                <h4>${titleInput.value.trim()}</h4>
                                <p>Description: ${descInput.value.trim()}</p>
                                <p>Goal: ${goalInput.value.trim()}</p>
                                <p>When: ${whenInput.value.trim()}</p>
                                <p>Obstacle: ${obstacleInput.value.trim()}</p>
                                <p>Plan: ${overcomeInput.value.trim()}</p>
                            `;
                            const checkboxesContainer = createCheckboxes(weekData, habitId);
                            entryBox.appendChild(checkboxesContainer);
                            entryBox.appendChild(createEditButton(entryBox, habitId));
                            entryBox.appendChild(createDeleteButton(entryBox, habitId));
                        })
                        .catch((error) => console.error("Error fetching week data after update:", error));
                } else {
                    alert("Failed to update habit.");
                }
            })
            .catch((error) => {
                console.error("Error updating habit:", error);
                alert("Failed to update habit.");
            });
    });

    // Cancel button functionality
    cancelButton.addEventListener("click", function () {
        console.log('Edit cancelled for habit ID:', habitId); // Debugging log

        // Fetch current week's checkboxes from the backend
        const weekStart = getCurrentWeekStart();
        fetch(`/api/habits/${habitId}/weeks/${weekStart}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        })
            .then((response) => response.json())
            .then((weekData) => {
                // Switch back to display mode with checkboxes
                entryBox.innerHTML = `
                    <h4>${titleText}</h4>
                    <p>Description: ${descriptionText}</p>
                    <p>Goal: ${goalText}</p>
                    <p>When: ${whenText}</p>
                    <p>Obstacle: ${obstacleText}</p>
                    <p>Plan: ${overcomeText}</p>
                `;
                const checkboxesContainer = createCheckboxes(weekData, habitId);
                entryBox.appendChild(checkboxesContainer);
                entryBox.appendChild(createEditButton(entryBox, habitId));
                entryBox.appendChild(createDeleteButton(entryBox, habitId));
            })
            .catch((error) => console.error("Error fetching week data after cancel:", error));
    });
});

return editButton;
}

function createDeleteButton(entryBox, habitId) {
    console.log('Creating delete button for habit ID:', habitId); // Debugging log

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");

    // Delete button icon
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "DeleteIcon.png"; // Path to your delete icon image
    deleteIcon.alt = "Delete Icon"; // Alternative text
    deleteIcon.style.width = "30px";
    deleteIcon.style.height = "30px";
    deleteButton.appendChild(deleteIcon);

    // Style the delete button
    deleteButton.style.position = "absolute";
    deleteButton.style.top = "10px";
    deleteButton.style.right = "50px"; // Adjust position relative to the edit button
    deleteButton.style.fontSize = "16px";
    deleteButton.style.background = "none";
    deleteButton.style.border = "none";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.color = "#d9534f";

    deleteButton.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this habit?")) {
            console.log('Deleting habit ID:', habitId); // Debugging log

            fetch(`/api/habits/${habitId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        console.log('Habit deleted successfully:', habitId);
                        entryBox.remove(); // Remove the habit from the UI
                    } else {
                        console.error('Failed to delete habit:', data.message);
                        alert('Failed to delete habit.');
                    }
                })
                .catch((error) => {
                    console.error('Error deleting habit:', error);
                    alert('An error occurred while deleting the habit.');
                });
        }
    });

    return deleteButton;
}

function createCheckboxes(weekStatus = {}, habitId) {
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Default unchecked state for each day
    daysOfWeek.forEach((day) => {
        if (weekStatus[day] === undefined) {
            weekStatus[day] = 0; // Default to unchecked
        }
    });

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "flex-end";
    container.style.marginBottom = "30px";
    container.style.marginTop = "30px";
    container.style.justifyContent = "space-between";
    container.style.height = "80px"; // Consistent height for alignment
    container.style.flexDirection = "row"; // Ensure elements are in a row (side by side)
    container.style.flexWrap = "nowrap"; // Prevent wrapping

    const checkboxesContainer = document.createElement("div");
    checkboxesContainer.style.display = "flex";
    checkboxesContainer.style.alignItems = "center";
    checkboxesContainer.style.gap = "20px";
    checkboxesContainer.style.flexGrow = 1; // Allow checkboxes container to take up remaining space
    checkboxesContainer.style.flexDirection = "row"; // Ensure checkboxes are displayed in a row

    // Create Current Streak Display
    const streakContainer = document.createElement("div");
    streakContainer.style.display = "flex";
    streakContainer.style.flexDirection = "column";
    streakContainer.style.alignItems = "center";
    streakContainer.style.justifyContent = "flex-end"; // Align to bottom
    streakContainer.style.marginTop = "200px"; // Push it to the bottom of the parent container
    streakContainer.style.marginBottom = "150px"; // Push it to the bottom of the parent container
    streakContainer.style.marginRight = "80px"; // Adjust right margin for spacing

    const streakNumber = document.createElement("div");
    streakNumber.style.fontSize = "75px";
    streakNumber.style.color = "#555"; // Dark grey
    streakNumber.style.fontWeight = "bold";
    streakNumber.textContent = "0";

    const streakLabel = document.createElement("div");
    streakLabel.style.fontSize = "16px";
    streakLabel.style.color = "#555";
    streakLabel.textContent = "Current Streak";


    streakContainer.appendChild(streakNumber);
    streakContainer.appendChild(streakLabel);

    // Helper to calculate streak across all days
 const calculateStreak = async () => {
    console.log('Fetching checkboxes for habit:', habitId); // Debugging log
    try {
        const response = await fetch(`/api/habits/${habitId}/allCheckboxes`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch all checkboxes');
        }

        const allWeeks = await response.json();
        let allDaysStatus = [];
        console.log('Fetched all checkboxes:', allWeeks); // Debugging log

        // Flatten all weeks' checkboxes into a single array
        allWeeks.forEach((week) => {
            console.log('Processing week:', week); // Debugging log
            if (week.checkboxes) {
                let weekData;
                if (typeof week.checkboxes === "string") {
                    try {
                        weekData = JSON.parse(week.checkboxes); // Parse JSON string
                    } catch (error) {
                        console.error(`Invalid JSON for habit ${habitId} on week starting ${week.week_start}:`, week.checkboxes);
                        return; // Skip invalid data
                    }
                } else if (typeof week.checkboxes === "object") {
                    weekData = week.checkboxes; // Already parsed
                }

                if (weekData) {
                    allDaysStatus = allDaysStatus.concat(Object.values(weekData)); // Flatten to array
                }
            } else {
                console.error(`Missing checkboxes data for habit ${habitId} on week starting ${week.week_start}`);
            }
        });

        console.log('Flattened checkbox data:', allDaysStatus);

        // Calculate the streak
        let currentStreak = 0;
        for (let i = allDaysStatus.length - 1; i >= 0; i--) {
            if (allDaysStatus[i] === 1) {
                currentStreak++;
            } else {
                break; // Stop counting streak on first 0
            }
        }

        console.log('Calculated current streak:', currentStreak);
        streakNumber.textContent = currentStreak; // Update the streak display
        return currentStreak;
    } catch (error) {
        console.error("Error calculating streak:", error);
        streakNumber.textContent = 0; // Default to 0
        return 0;
    }
};


    // Initialize streak display on load
    calculateStreak();

    daysOfWeek.forEach((day) => {
        const checkboxWrapper = document.createElement("div");
        checkboxWrapper.style.display = "flex";
        checkboxWrapper.style.justifyContent = "center";
        checkboxWrapper.style.alignItems = "center";
        checkboxWrapper.style.width = "60px";
        checkboxWrapper.style.height = "60px";
        checkboxWrapper.style.borderRadius = "5px";
        checkboxWrapper.style.cursor = "pointer";
        checkboxWrapper.style.border = "2px solid #ddd";
        checkboxWrapper.style.transition = "background 0.3s, color 0.3s, transform 0.2s";

        const checkboxId = `day-${day}-${habitId}`;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = checkboxId;
        checkbox.dataset.day = day;
        checkbox.checked = weekStatus[day] === 1;

        // Checkbox styling based on state
        if (checkbox.checked) {
            checkboxWrapper.style.background = "linear-gradient(to bottom, #388BFF, #5ECFFF)";
            checkboxWrapper.style.border = "#388BFF";
        }

        const label = document.createElement("span");
        label.textContent = day;
        label.style.color = checkbox.checked ? "white" : "#aaa";
        label.style.fontSize = "20px";
        label.style.transition = "color 0.3s";

        checkboxWrapper.addEventListener("click", function () {
            checkbox.checked = !checkbox.checked;
            weekStatus[day] = checkbox.checked ? 1 : 0;

            // Update styling on click
            if (checkbox.checked) {
                label.style.color = "white";
                checkboxWrapper.style.background = "linear-gradient(to bottom, #388BFF, #5ECFFF)";
                checkboxWrapper.style.border = "#388BFF";
            } else {
                label.style.color = "#aaa";
                checkboxWrapper.style.background = "white";
                checkboxWrapper.style.border = "2px solid #ddd";
            }

            // Update streak dynamically after click
            calculateStreak().then((streak) => {
                streakNumber.textContent = streak;  // Update streak number after clicking
            });

            const updatedCheckboxes = {};
            daysOfWeek.forEach((d) => {
                const cb = document.getElementById(`day-${d}-${habitId}`);
                updatedCheckboxes[d] = cb && cb.checked ? 1 : 0;
            });

            const weekStart = getCurrentWeekStart();
            saveCheckboxState(habitId, weekStart, updatedCheckboxes);
        });

        checkboxWrapper.appendChild(label);
        checkboxWrapper.appendChild(checkbox);
        checkboxesContainer.appendChild(checkboxWrapper);
    });

    container.appendChild(checkboxesContainer);
    container.appendChild(streakContainer);

    return container;
}




function loadCheckboxes(habitId) {
    const weekStart = getWeekStartDate(displayedWeek); // Get the correct week start date
    console.log("Week start (before fetch):", weekStart);  // Debugging log to ensure weekStart is correct

    fetch(`/api/habits/${habitId}/weeks/${weekStart}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    })
    .then((response) => response.json())
    .then((checkboxes) => {
        console.log("Fetched checkboxes for habit:", habitId, "Week start:", weekStart, "Checkboxes data:", checkboxes);
        daysOfWeek.forEach((day) => {
            const checkbox = document.getElementById(`day-${day}-${habitId}`);
            if (checkbox) {
                checkbox.checked = checkboxes[day] === 1;
            }
        });
    })
    .catch((error) => console.error("Error loading checkbox states:", error));
}

function saveCheckboxState(habitId, weekStart, updatedCheckboxes) {
    const token = localStorage.getItem('authToken');

    fetch(`/api/habits/${habitId}/weeks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            habitId: habitId,
            weekStart: weekStart,
            checkboxes: updatedCheckboxes,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Checkbox state saved successfully!");
        } else {
            console.error("Error saving checkbox state:", data.message);
        }
    })
    .catch(error => {
        console.error("Error saving checkbox state:", error);
    });
}

function getCurrentWeekStart() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day; // Subtract day to get Sunday
    const weekStart = new Date(today.setDate(diff));
    console.log("Week start:", weekStart); // Debugging log
    return weekStart.toISOString().split("T")[0]; // Return the date in YYYY-MM-DD format
}

function getWeekStartDate(displayedWeek) {
    console.log("Displayed week:", displayedWeek); // Log displayedWeek
    const firstDay = displayedWeek.getDate() - displayedWeek.getDay(); // Get the Sunday of the current week
    const weekStart = new Date(displayedWeek.setDate(firstDay));
    console.log("Calculated week start:", weekStart); // Log the calculated week start
    return weekStart.toISOString().split("T")[0]; // Return the date in YYYY-MM-DD format
}



// Get the end of the week (Sunday)
function getEndOfWeek(date) {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // 6 days after the start of the week
    end.setHours(23, 59, 59, 999); // Set to end of the day
    return end;
}

function fetchHabitsForWeek() {
  const { start, end } = getWeekRange(displayedWeek); // Get the correct week range for displayedWeek

  console.log("Fetching habits for:", start, "to", end);  // Debugging log

  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("No token provided");
    return;
  }

  fetch(`/api/habits?start_date=${start}&end_date=${end}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => response.json())
  .then((data) => {
    console.log("Fetched habits data:", data); // Debugging log
    renderHabits(data.habits); // Render habits for the selected week
  })
  .catch((error) => console.error("Failed to fetch habits:", error));
}

// Render fetched habits for the current week
function renderHabits(habits = []) {
    const habitsContainer = document.getElementById("habitEntries");
    habitsContainer.innerHTML = ""; // Clear existing habits

    if (!habits || habits.length === 0) {
        console.log("No habits found for the selected week.");
        return; // Exit if there are no habits
    }

    habits.forEach((habit) => {
        const habitElement = createEntry("habit", habit);
        habitsContainer.appendChild(habitElement);

        // Load checkbox states for the displayed week
        loadCheckboxes(habit.id);
    });
}


