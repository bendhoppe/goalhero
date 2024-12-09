const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken'); // Auth middleware

const dummyName = "default habit name"; // A placeholder value

module.exports = (db) => {
    // Apply authentication middleware
    router.use(authenticateToken);

    // Get all habits for the logged-in user
    router.get('/', (req, res) => {
        const userId = req.userId;

        db.all(
            `SELECT *
             FROM habits
             WHERE user_id = ?`,
            [userId],
            (err, rows) => {
                if (err) {
                    console.error('Error fetching habits:', err.message);
                    return res.status(500).json({error: 'Server error'});
                }
                res.json(rows);
            }
        );
    });

    router.get('/:habitId/allCheckboxes', (req, res) => {
        const {habitId} = req.params;

        const query = `
            SELECT *
            FROM habit_weeks
            WHERE habit_id = ?;
        `;

        db.all(query, [habitId], (err, rows) => {
            if (err) {
                console.error('Error fetching all checkboxes:', err.message);
                return res.status(500).json({error: 'Server error'});
            }

            console.log(`Fetched data for habitId ${habitId}:`, rows);

            if (!rows || rows.length === 0) {
                console.log('No checkbox data found for habitId:', habitId);
                return res.status(404).json({error: 'No checkbox data found for the given habit'});
            }

            const allCheckboxes = rows.map(row => {
                return {
                    habit_id: row.habit_id,
                    week_start: row.week_start,
                    checkboxes: JSON.parse(row.checkboxes)
                }
            }); 
            res.json(allCheckboxes);
        });
    });


    // Add a new habit
    router.post('/', (req, res) => {
        const userId = req.userId;
        const {title, description, goal_id, when, obstacle, overcome} = req.body;

        const query = `
            INSERT INTO habits (user_id, title, description, goal_id, when_to_perform, obstacle, plan_to_overcome, name,
                                frequency)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
            query,
            [userId, title, description, goal_id, when, obstacle, overcome, "default", "default_frequency"],  // No need to pass "created_at"
            function (err) {
                if (err) {
                    console.error('Error adding habit:', err.message);
                    return res.status(500).json({error: 'Server error'});
                }
                res.status(201).json({success: true, habitId: this.lastID});  // `this.lastID` returns the auto-generated habit ID
            }
        );
    });

    // Save weekly checkbox states
    router.post('/:habitId/weeks', (req, res) => {
        const {habitId} = req.params;
        const {weekStart, checkboxes} = req.body;

        const query = `
            INSERT INTO habit_weeks (habit_id, week_start, checkboxes)
            VALUES (?, ?, ?)
            ON CONFLICT(habit_id, week_start) DO UPDATE SET checkboxes = excluded.checkboxes
        `;
        db.run(
            query,
            [habitId, weekStart, JSON.stringify(checkboxes)],
            function (err) {
                if (err) {
                    console.error('Error saving week data:', err.message);
                    return res.status(500).json({error: 'Server error'});
                }
                res.json({success: true});
            }
        );
    });

    router.get('/:habitId/weeks/:weekStart', (req, res) => {
        const {habitId, weekStart} = req.params;
        console.log("Fetching checkboxes for habitId:", habitId, "Week start:", weekStart); // Debugging log

        const query = `
            SELECT checkboxes
            FROM habit_weeks
            WHERE habit_id = ?
              AND week_start = ?
        `;
        db.get(query, [habitId, weekStart], (err, row) => {
            if (err) {
                console.error('Error fetching week data:', err.message);
                return res.status(500).json({error: 'Server error'});
            }
            res.json(row ? JSON.parse(row.checkboxes) : []);
        });
    });


    router.put('/:habitId', (req, res) => {
        const {habitId} = req.params;
        const {title, description, goal_id, when_to_perform, obstacle, plan_to_overcome} = req.body;

        const query = `
            UPDATE habits
            SET title            = ?,
                description      = ?,
                goal_id          = ?,
                when_to_perform  = ?,
                obstacle         = ?,
                plan_to_overcome = ?
            WHERE id = ?
        `;
        db.run(
            query,
            [title, description, goal_id, when_to_perform, obstacle, plan_to_overcome, habitId],
            function (err) {
                if (err) {
                    console.error('Error updating habit:', err.message);
                    return res.status(500).json({error: 'Failed to update habit'});
                }
                res.json({success: true});
            }
        );
    });

    router.delete('/:habitId', (req, res) => {
        const {habitId} = req.params;

        const query = `DELETE
                       FROM habits
                       WHERE id = ?`;
        db.run(query, [habitId], function (err) {
            if (err) {
                console.error('Error deleting habit:', err.message);
                return res.status(500).json({error: 'Failed to delete habit'});
            }
            res.json({success: true});
        });
    });

    // Backend: Save the week status immediately after habit creation
    router.post('/weeks', (req, res) => {
        const userId = req.userId;
        const {habitId, weekStart, checkboxes} = req.body;

        const query = `
            INSERT INTO habit_weeks (user_id, habit_id, week_start, checkboxes)
            VALUES (?, ?, ?, ?)
        `;

        db.run(query, [userId, habitId, weekStart, JSON.stringify(checkboxes)], function (err) {
            if (err) {
                console.error('Error saving checkbox state:', err.message);
                return res.status(500).json({error: 'Server error'});
            }
            res.json({success: true});
        });
    });


    return router;
};

