const db = require('../database'); // Assuming you've set up a SQLite3 connection here

// Insert new goal entry into the database
exports.createGoal = (goalData, callback) => {
    const { title, description, journalEntry, totalUnits } = goalData;
    const query = 'INSERT INTO goals (title, description, journal_entry, total_units) VALUES (?, ?, ?, ?)';

    db.run(query, [title, description, journalEntry, totalUnits], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { id: this.lastID, ...goalData }); // Return the inserted goal with its ID
    });
};


// Update an existing goal entry
exports.updateGoal = (goalId, goalData, callback) => {
    const { title, description, journalEntry, totalUnits } = goalData;
    const query = 'UPDATE goals SET title = ?, description = ?, journal_entry = ?, total_units = ? WHERE id = ?';

    db.run(query, [title, description, journalEntry, totalUnits, goalId], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { id: goalId, ...goalData }); // Return updated goal
    });
};

// Delete a goal entry
exports.deleteGoal = (goalId, callback) => {
    const query = 'DELETE FROM goals WHERE id = ?';

    db.run(query, [goalId], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { message: 'Goal deleted successfully' });
    });
};

// Fetch all goal entries from the database
exports.getAllGoals = (callback) => {
    const query = 'SELECT * FROM goals';

    db.all(query, [], (err, rows) => {
        if (err) {
            return callback(err);
        }
        callback(null, rows); // Return all the goals
    });
};
