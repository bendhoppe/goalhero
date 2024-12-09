function createEntry(entryType) {
    const entryBox = document.createElement("div");
    entryBox.classList.add("entry");
    entryBox.style.position = "relative";

    // Title Input and Label
    const titleInput = document.createElement("input");
    titleInput.placeholder = "Enter title";
    titleInput.style.width = "100%";
    titleInput.style.marginBottom = "10px";

    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Title:";
    titleLabel.style.fontSize = "12px";
    titleLabel.style.fontWeight = "bold";
    titleLabel.style.marginBottom = "5px";

    // Description Input and Label
    const descInput = document.createElement("textarea");
    descInput.placeholder = "Enter description";
    descInput.style.width = "100%";
    descInput.style.marginBottom = "10px";

    const descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Description:";
    descriptionLabel.style.fontSize = "12px";
    descriptionLabel.style.fontWeight = "bold";
    descriptionLabel.style.marginBottom = "10px";

    // Dropdown for associated journal entry
    const entryAssociatedLabel = document.createElement("label");
    entryAssociatedLabel.textContent = "What entry is this goal associated with?";
    entryAssociatedLabel.style.fontSize = "12px";
    entryAssociatedLabel.style.fontWeight = "bold";
    entryAssociatedLabel.style.marginBottom = "10px";

    const journalDropdown = document.createElement("select");
    journalDropdown.style.width = "100%";
    journalDropdown.style.height = "35px";
    journalDropdown.style.marginBottom = "10px";
    const option1 = document.createElement("option");
    option1.textContent = "Select a journal entry";
    option1.value = "";
    journalDropdown.appendChild(option1);

    fetch('/api/journal_entries', {
        headers: {'Authorization': `Bearer ${localStorage.getItem('authToken')}`}
    })
        .then((response) => response.json())
        .then((entries) => {
            entries.forEach((entry) => {
                const option = document.createElement("option");
                option.value = entry.id;
                option.textContent = entry.title;
                journalDropdown.appendChild(option);
            });
        });

    // Goal Total Units input field
    const totalUnitsLabel = document.createElement("label");
    totalUnitsLabel.textContent = "Total Units:";
    totalUnitsLabel.style.fontSize = "12px";
    totalUnitsLabel.style.fontWeight = "bold";
    totalUnitsLabel.style.marginBottom = "5px";

    const totalUnitsInput = document.createElement("input");
    totalUnitsInput.placeholder = "Enter total units for this goal";
    totalUnitsInput.type = "number";
    totalUnitsInput.style.width = "100%";
    totalUnitsInput.style.marginBottom = "10px";

    // Create Save and Cancel buttons
    const saveButton = document.createElement("button");
    saveButton.classList.add("save-button");
    saveButton.textContent = "Save";

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("cancel-button");
    cancelButton.textContent = "Cancel";


    saveButton.addEventListener("click", async function () {
        const updatedTitle = titleInput.value.trim();
        const updatedDescription = descInput.value.trim();
        const updatedJournalEntry = journalDropdown.value;
        const totalUnits = parseInt(totalUnitsInput.value, 10);

        if (!updatedTitle || !updatedDescription) {
            alert("Title and Description cannot be empty.");
            return;
        }

        if (!updatedJournalEntry) {
            alert("Please select an associated journal entry.");
            return;
        }

        if (isNaN(totalUnits) || totalUnits <= 0) {
            alert("Total units must be a positive number.");
            return;
        }

        // Add goal to the server
        try {
            const response = await fetch("/api/goals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({
                    title: updatedTitle,
                    description: updatedDescription,
                    entry_id: updatedJournalEntry, // Use `entry_id` here
                    total_units: totalUnits,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create goal.");
            }

            const data = await response.json();

            console.log("Goal creation response data:", data); // Debugging line

            if (data.success) {
                entryBox.innerHTML = ""; // Clear the entry box

                const titleElement = document.createElement("h4");
                titleElement.textContent = data.title;

                const descElement = document.createElement("p");
                descElement.textContent = data.description;

                // Fetch the journal entry title if `entry_id` exists
                let journalEntryElement = document.createElement("p");
                if (data.entry_id) {
                    fetch(`/api/journal_entries/${data.entry_id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    })
                        .then(response => response.json())
                        .then(journalEntryData => {
                            // Check if journalEntryData exists and display title
                            if (journalEntryData && journalEntryData.title) {
                                journalEntryElement.textContent = `Associated with: ${journalEntryData.title}`;
                            } else {
                                journalEntryElement.textContent = "Associated with: N/A";
                            }
                        })
                        .catch(() => {
                            journalEntryElement.textContent = "Associated with: N/A";
                        });
                } else {
                    journalEntryElement.textContent = "Associated with: N/A";
                }


                const progressContainer = document.createElement("div");
                progressContainer.style.position = "relative";
                progressContainer.style.width = "86%";
                progressContainer.style.height = "20px";
                progressContainer.style.backgroundColor = "#e0e0e0";
                progressContainer.style.borderRadius = "10px";
                progressContainer.style.overflow = "hidden";

                const progressBar = document.createElement("div");
                progressBar.style.height = "100%";
                progressBar.style.backgroundColor = "#388BFF";
                progressBar.style.width = `0%`; // New goal starts with 0 progress

                progressContainer.appendChild(progressBar);

                const progressRatio = document.createElement("div");
                progressRatio.style.position = "absolute";
                progressRatio.style.right = "30px";
                progressRatio.style.bottom = "20px";
                progressRatio.style.fontSize = "14px";

                const numeratorInput = document.createElement("input");
                numeratorInput.type = "number";
                numeratorInput.value = 0; // Start with 0 progress
                numeratorInput.style.width = "60px";
                numeratorInput.style.marginRight = "5px";

                const denominatorInput = document.createElement("input");
                denominatorInput.type = "text";
                denominatorInput.value = data.total_units; // Use total_units from `data`
                denominatorInput.disabled = true; // Make total units uneditable
                denominatorInput.style.width = "50px";
                denominatorInput.style.border = "none";

                progressRatio.appendChild(numeratorInput);
                progressRatio.appendChild(document.createTextNode(" / "));
                progressRatio.appendChild(denominatorInput);

                entryBox.appendChild(titleElement);
                entryBox.appendChild(descElement);
                entryBox.appendChild(journalEntryElement); // Display associated journal entry
                entryBox.appendChild(progressContainer);
                entryBox.appendChild(progressRatio);

                // Add edit and delete buttons
                entryBox.appendChild(createEditButton(entryBox, data.goalId, goal));
                entryBox.appendChild(createDeleteButton(entryBox, data.goalId));

                document.getElementById("goalEntries").appendChild(entryBox);
            } else {
                throw new Error(data.message || "Unknown error creating goal.");
            }
        } catch (error) {
            console.error("Error creating goal:", error);
            alert("Failed to create goal.");
        }
    });


    // Cancel button functionality
    cancelButton.addEventListener("click", () => entryBox.remove());

    // Append fields initially
    entryBox.appendChild(titleLabel);
    entryBox.appendChild(titleInput);
    entryBox.appendChild(descriptionLabel);
    entryBox.appendChild(descInput);
    entryBox.appendChild(entryAssociatedLabel);
    entryBox.appendChild(journalDropdown);
    entryBox.appendChild(totalUnitsLabel);
    entryBox.appendChild(totalUnitsInput);
    entryBox.appendChild(saveButton);
    entryBox.appendChild(cancelButton);

    document.getElementById("goalEntries").appendChild(entryBox);
}


window.onload = function () {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please log in to view your goals.');
        return;
    }

    fetch('/api/goals', {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching goals: ${response.statusText}`);
            }
            return response.json();
        })
        .then(goals => {
            console.log('Fetched goals:', goals); // Debugging log
            const goalContainer = document.getElementById('goalEntries');
            goals.forEach(goal => {
                const entryBox = document.createElement('div');
                entryBox.classList.add('entry');

                entryBox.innerHTML = `
                    <h4>${goal.title}</h4>
                    <p>${goal.description}</p>
                    <p>Associated with: ${goal.journal_entry}</p>
                    <p>Total Units: ${goal.total_units}</p>
                    <p>Target Date: ${goal.target_date}</p>
                    <div style="background-color: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="background-color: #388BFF; height: 100%; width: ${goal.progress}%;"></div>
                    </div>
                `;
                goalContainer.appendChild(entryBox);
            });
        })
        .catch(error => {
            console.error('Error loading goals:', error.message);
            alert('Failed to load goals.');
        });
};

// Goal Entry Logic
document.getElementById("addGoalBtn").addEventListener("click", () => createEntry("goal"));

function createEditButton(entryBox, entryId, goal) {
    console.log('Creating edit button for goal ID:', entryId);

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");

    const editIcon = document.createElement("img");
    editIcon.src = "EditIcon.png"; // Path to your edit icon image
    editIcon.alt = "Edit Icon";
    editIcon.style.width = "30px";
    editIcon.style.height = "30px";
    editButton.appendChild(editIcon); // Add the icon to the button

    // Style the edit button
    editButton.style.position = "absolute";
    editButton.style.top = "10px";
    editButton.style.right = "10px";
    editButton.style.fontSize = "16px";
    editButton.style.background = "none";
    editButton.style.border = "none";
    editButton.style.cursor = "pointer";
    editButton.style.color = "#555";

    // Add event listener for edit
    editButton.addEventListener("click", function () {
        console.log("Edit button clicked for goal ID:", entryId);
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Authorization token is missing');
            return;  // Exit if there's no token
        }

        fetch(`/api/goals/${entryId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch goal data.");
                }
                return response.json();
            })
            .then((goalData) => {
                console.log("Fetched goal data:", goalData);

                // Create input fields for title, description, and journal entry
                const titleInput = document.createElement("input");
                const descInput = document.createElement("textarea");
                const journalEntrySelect = document.createElement("select");

                // Pre-fill input fields with the current goal data
                titleInput.value = goalData.title || "";
                descInput.value = goalData.description || "";

                // Only create journal entry dropdown if journal_entry exists
                if (goalData.journal_entry) {
                    const option = document.createElement("option");
                    option.textContent = goalData.journal_entry;
                    journalEntrySelect.appendChild(option);
                }

                // Clear the entryBox and append the input fields
                entryBox.innerHTML = "";
                entryBox.appendChild(titleInput);
                entryBox.appendChild(descInput);

                // Only append the journal entry select if it's populated
                if (goalData.journal_entry) {
                    entryBox.appendChild(journalEntrySelect);
                }
                const breakElement = document.createElement("br");
                entryBox.appendChild(breakElement);

                // Create Save and Cancel buttons
                const saveButton = document.createElement("button");
                saveButton.textContent = "Save";
                saveButton.classList.add("save-button");

                const cancelButton = document.createElement("button");
                cancelButton.textContent = "Cancel";
                cancelButton.classList.add("cancel-button");

                // Add Save functionality
                saveButton.addEventListener("click", function () {
                    const updatedTitle = titleInput.value.trim();
                    const updatedDescription = descInput.value.trim();
                    const updatedJournalEntry = journalEntrySelect.value;

                    if (!updatedTitle || !updatedDescription) {
                        alert("Title and description are required.");
                        return;
                    }

                    console.log("Saving updated goal with data:", updatedTitle, updatedDescription, updatedJournalEntry);

                    fetch(`/api/goals/${entryId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        },
                        body: JSON.stringify({
                            title: updatedTitle,
                            description: updatedDescription,
                            journal_entry: updatedJournalEntry || goalData.journal_entry, // Retain the original if not updated
                            progress: goalData.progress,
                            total_units: goalData.total_units,
                        }),
                    })
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error("Failed to update goal.");
                            }
                            return response.json();
                        })
                        .then((data) => {
                            console.log("Response after update:", data);
                            if (data.success) {
                                console.log("Goal updated successfully:", data.goal);

                                // Ensure that data.goal exists
                                const updatedGoal = data.goal;
                                if (updatedGoal) {
                                    // Re-render the goal entry with updated data
                                    entryBox.innerHTML = ""; // Clear the entryBox

                                    // Create new elements for the updated goal
                                    const titleElement = document.createElement("h4");
                                    titleElement.textContent = updatedGoal.title;

                                    const descElement = document.createElement("p");
                                    descElement.textContent = updatedGoal.description;

                                    const journalEntryElement = document.createElement("p");
                                    journalEntryElement.textContent = `Associated with: ${updatedGoal.journal_entry || "No journal entry"}`;

                                    // Append the updated goal details
                                    entryBox.appendChild(titleElement);
                                    entryBox.appendChild(descElement);
                                    entryBox.appendChild(journalEntryElement);

                                    // Progress Bar
                                    createProgressBar(entryBox, goal);

                                    // Recreate edit and delete buttons after updating goal
                                    entryBox.appendChild(createEditButton(entryBox, entryId, goal));
                                    entryBox.appendChild(createDeleteButton(entryBox, entryId));
                                } else {
                                    console.error("Goal data is missing in the response:", data);
                                }
                            } else {
                                console.error("Error updating goal:", data.message);
                            }
                        })
                        .catch((error) => {
                            console.error("Error with goal update request:", error);
                        });
                });

                // Add Cancel functionality
                cancelButton.addEventListener("click", function () {
                    console.log("Edit canceled, reverting to original goal.");
                    entryBox.innerHTML = ""; // Clear the content

                    // Recreate the original goal entry
                    const titleElement = document.createElement("h4");
                    titleElement.textContent = goalData.title;

                    const descElement = document.createElement("p");
                    descElement.textContent = goalData.description;

                    const journalEntryElement = document.createElement("p");
                    journalEntryElement.textContent = `Associated with: ${goalData.journal_entry || "No journal entry"}`;

                    entryBox.appendChild(titleElement);
                    entryBox.appendChild(descElement);
                    entryBox.appendChild(journalEntryElement);



                    // Recreate edit and delete buttons
                    entryBox.appendChild(createEditButton(entryBox, entryId, goal));
                    entryBox.appendChild(createDeleteButton(entryBox, entryId));
                });

                entryBox.appendChild(saveButton);
                entryBox.appendChild(cancelButton);
            })
            .catch((error) => {
                console.error("Error fetching goal data for editing:", error);
                alert("Failed to load goal data for editing.");
            });
    });

    return editButton;
}


function createDeleteButton(entryBox, entryId) {
    const deleteButton = document.createElement("button");
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "DeleteIcon.png"; // Path to your delete icon image
    deleteIcon.alt = "Delete Icon";
    deleteIcon.style.width = "30px";
    deleteIcon.style.height = "30px";
    deleteButton.appendChild(deleteIcon);

    // Style the delete button
    deleteButton.style.position = "absolute";
    deleteButton.style.top = "18px";
    deleteButton.style.right = "60px"; // Adjust position relative to the edit button
    deleteButton.style.fontSize = "16px";
    deleteButton.style.background = "none";
    deleteButton.style.border = "none";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.color = "#d9534f";

    // Event listener for deleting
    deleteButton.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this goal?")) {
            fetch(`/api/goals/${entryId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to delete goal.");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Response from server:", data); // Log the response data
                    // Check for the specific success message
                    if (data.message === "Goal deleted successfully") {
                        console.log("Deleting the entry from the DOM"); // Log the action
                        entryBox.remove();  // Remove the entry from the DOM after successful deletion
                    } else {
                        console.error('Failed to delete goal:', data.message);
                        alert('Failed to delete goal.');
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    alert("There was an error deleting the goal.");
                });
        }
    });

    return deleteButton;
}


function createProgressBar(entryBox, goal) {
// Progress Bar
    const progressContainer = document.createElement("div");
    progressContainer.style.position = "relative";
    progressContainer.style.width = "86%";
    progressContainer.style.height = "20px";
    progressContainer.style.backgroundColor = "#e0e0e0";
    progressContainer.style.borderRadius = "10px";
    progressContainer.style.overflow = "hidden";

    const progressBar = document.createElement("div");
    progressBar.style.height = "100%";
    progressBar.style.backgroundColor = "#388BFF";
    progressBar.style.width = `${goal.progress}%`;  // Set progress based on API data

    // Ratio (numerator / total)
    const progressRatio = document.createElement("div");
    progressRatio.style.position = "absolute";
    progressRatio.style.right = "30px";
    progressRatio.style.bottom = "20px";
    progressRatio.style.fontSize = "14px";

    // Numerator and denominator input elements
    const numeratorInput = document.createElement("input");
    numeratorInput.type = "number";
    numeratorInput.value = goal.numerator || 0; // Set to current progress or 0
    numeratorInput.style.width = "60px";
    numeratorInput.style.marginRight = "5px";

    const denominatorInput = document.createElement("input");
    denominatorInput.type = "text";
    denominatorInput.value = goal.total_units || 1; // Default to 1 if not available
    denominatorInput.disabled = true; // Make total units uneditable
    denominatorInput.style.width = "50px";
    denominatorInput.style.border = "none";

    // Append the numerator/denominator to the ratio container
    progressRatio.appendChild(numeratorInput);
    progressRatio.appendChild(document.createTextNode(" / "));
    progressRatio.appendChild(denominatorInput);

    // Update progress bar based on numerator input
    numeratorInput.addEventListener("input", function () {
        const numeratorValue = parseInt(numeratorInput.value) || 0;
        const denominatorValue = parseInt(denominatorInput.value) || 1;
        const progress = Math.min((numeratorValue / denominatorValue) * 100, 100); // Ensure progress doesn't exceed 100%

        progressBar.style.width = progress + "%";

        // Optionally, persist progress to the server when it changes
        fetch(`/api/goals/${goal.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({progress, numerator:numeratorValue}),
        });
    });

    // Add progress bar to the container
    progressContainer.appendChild(progressBar);
    entryBox.appendChild(progressContainer);
    entryBox.appendChild(progressRatio);
}


function createGoalEntry(goal) {
    const entryBox = document.createElement("div");
    entryBox.classList.add("entry");
    entryBox.dataset.id = goal.id;  // Set the data-id attribute for this goal
    entryBox.style.position = "relative";

    // Title and Description Elements
    const titleElement = document.createElement("h4");
    titleElement.textContent = goal.title;

    const descElement = document.createElement("p");
    descElement.textContent = goal.description;

    // Associated Journal Entry
    const journalEntryElement = document.createElement("p");
    journalEntryElement.textContent = `Associated with: ${goal.journal_entry ? goal.journal_entry : "N/A"}`;


    // Edit and Delete buttons (with icons)
    const editButton = createEditButton(entryBox, goal.id, goal);
    const deleteButton = createDeleteButton(entryBox, goal.id);

    // Append all elements to the entryBox
    entryBox.appendChild(editButton);
    entryBox.appendChild(deleteButton);
    entryBox.appendChild(titleElement);
    entryBox.appendChild(descElement);
    entryBox.appendChild(journalEntryElement);

    // Progress Bar
    createProgressBar(entryBox, goal);

    // Append the goal entry to the container (goalEntries)
    document.getElementById("goalEntries").appendChild(entryBox);
}


// Function to fetch and display saved goals when the page loads
window.onload = function () {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please log in to view your goals.');
        return;
    }

    fetch('/api/goals', {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching goals: ${response.statusText}`);
            }
            return response.json();
        })
        .then(goals => {
            const goalContainer = document.getElementById('goalEntries');
            goals.forEach(goal => {
                // Call the createGoalEntry function for each goal to properly display them
                createGoalEntry(goal);
            });
        })
        .catch(error => {
            console.error('Error loading goals:', error.message);
            alert('Failed to load goals.');
        });
};
