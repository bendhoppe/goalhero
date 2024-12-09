// Create a new journal entry
function createEntry(entryType) {
    const entryBox = document.createElement("div");
    entryBox.classList.add("entry");
    entryBox.style.position = "relative";


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
    cancelButton.textContent = "Cancel";

    saveButton.addEventListener("click", function () {
        const title = titleInput.value;
        const description = descInput.value;

        if (title && description) {
            console.log('Attempting to save entry with title:', title, 'and description:', description); // Debugging log

            fetch('/api/journal_entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ title, description })
            })

            .then(response => {
                console.log('Response status:', response.status); // Debug response status
                if (!response.ok) {
                    throw new Error(`Failed to save entry: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Server response:', data); // Debug server response
                if (data.entryId) {
                    const titleElement = document.createElement("h4");
                    titleElement.textContent = title;

                    const descElement = document.createElement("p");
                    descElement.textContent = description;

                    // Add edit and delete buttons (with icons)
                    const editButton = createEditButton(entryBox, data.entryID);
                    const deleteButton = createDeleteButton(entryBox, data.entryID);

                    // Append all elements back to the entryBox
                    entryBox.appendChild(editButton);
                    entryBox.appendChild(deleteButton);

                    entryBox.innerHTML = ""; // Clear the entry box
                    entryBox.appendChild(titleElement);
                    entryBox.appendChild(descElement);

                    document.getElementById("futureEntries").appendChild(entryBox);
                } else {
                    console.error('Error: Invalid response format from server', data); // Debugging error log
                    alert('Error saving entry: Invalid response');
                }
            })
            .catch(error => {
                console.error('Save error:', error); // Debugging catch block
                alert('Error saving entry');
            });
        } else {
            alert("Both title and description are required.");
        }
    });

    cancelButton.addEventListener("click", function() {
        console.log('Entry creation canceled'); // Debugging log
        entryBox.remove();
    });


    entryBox.appendChild(titleInput);
    entryBox.appendChild(descInput);
    entryBox.appendChild(saveButton);
    entryBox.appendChild(cancelButton);

    const containerId = entryType === 'goal' ? 'goalEntries' : 'futureEntries';
    document.getElementById(containerId).appendChild(entryBox);
}

// Future Journaling Entry Logic
document.getElementById("addEntryBtn").addEventListener("click", function() {
    console.log('Add entry button clicked'); // Debugging log
    createEntry('entry');
});

window.onload = function () {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error('No auth token found'); // Debugging log
        alert('Please log in to view your journal entries.');
        return;
    }

    console.log('Fetching journal entries with token:', token); // Debugging log
    fetch('/api/journal_entries', {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => {
        console.log('Fetch response status:', response.status); // Debug response status
        if (!response.ok) {
            throw new Error('Failed to fetch entries');
        }
        return response.json();
    })
    .then(entries => {
        console.log('Fetched entries:', entries); // Debug log
        entries.forEach(entry => {
            displayJournalEntry(entry);
        });
    })
    .catch(error => {
        console.error('Fetch error:', error); // Debugging catch block
        alert('Error loading entries');
    });
};


function createEditButton(entryBox, entryId) {
    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");

    const editIcon = document.createElement("img");
    editIcon.src = "EditIcon.png"; // Path to your edit icon image
    editIcon.alt = "Edit Icon";
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
        const titleInput = document.createElement("input");
        titleInput.value = entryBox.querySelector("h4").textContent;

        const descInput = document.createElement("textarea");
        descInput.value = entryBox.querySelector("p").textContent;

        // Clear the entry box and add inputs
        entryBox.innerHTML = "";
        entryBox.appendChild(titleInput);
        entryBox.appendChild(descInput);

        // Create Save and Cancel buttons
        const saveButton = document.createElement("button");
        saveButton.classList.add("save-button");
        saveButton.textContent = "Save";

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";

        entryBox.appendChild(saveButton);
        entryBox.appendChild(cancelButton);

        // Save button functionality
        saveButton.addEventListener("click", function () {
            const updatedTitle = titleInput.value.trim();
            const updatedDescription = descInput.value.trim();

            if (!updatedTitle || !updatedDescription) {
                alert("Title and description are required.");
                return;
            }

            console.log("Saving updated entry:", updatedTitle, updatedDescription);

            fetch(`/api/journal_entries/${entryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ title: updatedTitle, description: updatedDescription }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        console.log("Entry updated successfully:", data);

                        // Revert back to display mode
                        entryBox.innerHTML = "";
                        const titleElement = document.createElement("h4");
                        titleElement.textContent = updatedTitle;

                        const descElement = document.createElement("p");
                        descElement.textContent = updatedDescription;

                        entryBox.appendChild(titleElement);
                        entryBox.appendChild(descElement);

                        entryBox.appendChild(createEditButton(entryBox, entryId));
                        entryBox.appendChild(createDeleteButton(entryBox, entryId));
                    } else {
                        alert("Failed to update entry.");
                    }
                })
                .catch((error) => {
                    console.error("Error updating entry:", error);
                    alert("Error updating entry");
                });
        });

        // Cancel button functionality
        cancelButton.addEventListener("click", function () {
            console.log("Edit canceled");

            // Revert back to display mode without saving
            const titleElement = document.createElement("h4");
            titleElement.textContent = titleInput.value;

            const descElement = document.createElement("p");
            descElement.textContent = descInput.value;

            entryBox.innerHTML = "";
            entryBox.appendChild(titleElement);
            entryBox.appendChild(descElement);
            entryBox.appendChild(createEditButton(entryBox, entryId));
            entryBox.appendChild(createDeleteButton(entryBox, entryId));
        });
    });

    return editButton;
}


// Create delete button dynamically for each entry
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

    deleteButton.addEventListener("click", function () {
        console.log("Delete button clicked for entry ID:", entryId); // Debugging log
        if (confirm("Are you sure you want to delete this entry?")) {
            fetch(`/api/journal_entries/${entryId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        console.log("Entry successfully deleted:", entryId); // Debugging log
                        entryBox.remove();
                    } else {
                        console.error("Error deleting entry:", data); // Debugging error log
                        alert("Error deleting entry");
                    }
                })
                .catch((error) => console.error("Delete error:", error));
        }
    });

    return deleteButton;
}

function createTextButton(className, text, backgroundColor, textColor, clickHandler) {
    const button = document.createElement("button");
    button.classList.add(className);
    button.textContent = text;

    button.style.margin = "10px 0";
    button.style.padding = "10px 20px";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.style.background = backgroundColor;  // Set the background color dynamically
    button.style.color = textColor;  // Set the text color dynamically

    if (clickHandler) {
        button.addEventListener("click", clickHandler);
    }
    return button;
}

// Save button (blue gradient)
const saveButton = createTextButton(
    "save-button",
    "Save",
    "linear-gradient(to right, #388BFF, #5ECFFF)", // Blue gradient background
    "#fff", // White text color
    () => {
        const title = titleInput.value;
        const description = descInput.value;

        if (title && description) {
            fetch(`/api/journal_entries/${entryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ title, description })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    entryBox.innerHTML = ''; // Clear and display updated content
                    entryBox.appendChild(titleInput);
                    entryBox.appendChild(descInput);
                    entryBox.appendChild(saveButton);  // Append updated save button
                    entryBox.appendChild(cancelButton);  // Append cancel button
                }
            });
        }
    }
);

// Cancel button (light gray)
const cancelButton = createTextButton(
    "cancel-button",
    "Cancel",
    "#f1f1f1", // Light grey background color
    "#555", // Dark grey text color
    () => {
        entryBox.remove(); // Remove entry box if canceled
    }
);
// Function to display fetched journal entries
function displayJournalEntry(entry) {
    console.log('Displaying journal entry:', entry); // Debugging log

    const entryBox = document.createElement("div");
    entryBox.classList.add("entry");
    entryBox.dataset.id = entry.id;
    entryBox.style.position = "relative";



    const titleElement = document.createElement("h4");
    titleElement.textContent = entry.title;

    const descElement = document.createElement("p");
    descElement.textContent = entry.description;

    // Edit and Delete buttons (with icons)
    const editButton = createEditButton(entryBox, entry.id);
    const deleteButton = createDeleteButton(entryBox, entry.id);

    // Append all elements to the entryBox
    entryBox.appendChild(editButton);
    entryBox.appendChild(deleteButton);
    entryBox.appendChild(titleElement);
    entryBox.appendChild(descElement);
    document.getElementById("futureEntries").appendChild(entryBox);
}
