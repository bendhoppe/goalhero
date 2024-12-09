const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

module.exports = (db) => {
    // Apply authentication middleware
    router.use(authenticateToken);


    router.get('/:goalId', (req, res) => {
        const userId = req.userId;

        const {goalId} = req.params;

        const query = `
            SELECT goals.title,
                   goals.description,
                   journal_entries.title AS journal_entry,
                   goals.status,
                   goals.total_units,
                   goals.target_date,
                   goals.progress,
                   goals.numerator,
                   goals.id
            FROM goals
                     JOIN
                 journal_entries
                 ON
                     goals.entry_id = journal_entries.id
            WHERE goals.user_id = ?
              AND goals.id = ?;
        `;
        console.log(`Fetching goals for user ID: ${userId}`); // Debug log

        db.all(query, [userId, goalId], (err, rows) => {
            if (err) {
                console.error('Error retrieving goals:', err.message);
                return res.status(500).json({error: 'Server error while retrieving goals'});
            }
            console.log('Goals fetched successfully:', rows); // Debug log
            res.json(rows[0]); // Includes the journal_entry_title field
        });
    });

    router.get('/', (req, res) => {
        const userId = req.userId;

        const query = `
            SELECT goals.title,
                   goals.description,
                   journal_entries.title AS journal_entry,
                   goals.status,
                   goals.total_units,
                   goals.target_date,
                   goals.progress,
                   goals.numerator,
                   goals.id
            FROM goals
                     JOIN
                 journal_entries
                 ON
                     goals.entry_id = journal_entries.id
            WHERE goals.user_id = ?;
        `;
        console.log(`Fetching goals for user ID: ${userId}`); // Debug log

        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('Error retrieving goals:', err.message);
                return res.status(500).json({error: 'Server error while retrieving goals'});
            }
            console.log('Goals fetched successfully:', rows); // Debug log
            res.json(rows); // Includes the journal_entry_title field
        });
    });


    router.post('/', (req, res) => {
        const {title, description, entry_id, total_units, target_date, progress = 0} = req.body;

        console.log('Incoming goal creation data:', req.body); // Debug log

        if (!title || !description || !entry_id || !total_units) {
            console.error('Missing required fields for creating a goal');
            return res.status(400).json({
                error: 'Title, description, entry ID, and total units are required',
            });
        }

        const query = `
            INSERT INTO goals (user_id, entry_id, title, description, total_units, target_date, progress)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
            query,
            [req.userId, entry_id, title, description, total_units, target_date, progress],
            function (err) {
                if (err) {
                    console.error('Error inserting goal into database:', err.message);
                    return res.status(500).json({error: 'Database error while inserting goal'});
                }
                console.log('Goal added successfully with ID:', this.lastID);
                res.status(201).json({
                    success: true,
                    goalId: this.lastID,
                    title,
                    description,
                    entry_id,
                    total_units,
                    target_date,
                    progress,
                });
            }
        );
    });

    // Update a goal
    router.put('/:goalId', (req, res) => {
        const userId = req.userId;
        const {goalId} = req.params;
        const {title, description, target_date, progress, numerator, journal_entry} = req.body;

        console.log(`Updating goal ID: ${goalId} for user ID: ${userId}`); // Debug log

        const query = `
            UPDATE goals
            SET title = COALESCE(?, title),
                description = COALESCE(?, description),
                target_date = COALESCE(?, target_date),
                progress = COALESCE(?, progress),
                numerator = COALESCE(?, numerator)
            WHERE id = ?
              AND user_id = ?
        `;

        db.run(query, [title, description, target_date, progress, numerator, goalId, userId], function (err) {
            if (err) {
                console.error('Error updating goal:', err.message);
                return res.status(500).json({error: 'Server error while updating goal'});
            }

            if (this.changes === 0) {
                return res.status(404).json({error: 'Goal not found or no changes made'});
            }

            console.log('Goal updated successfully:', {goalId, changes: this.changes}); // Debug log
            res.json({
                success: true,
                message: 'Goal updated successfully',
                goal: {title, description, target_date, progress, numerator, journal_entry}
            });
        });
    });

    // Delete a goal
    router.delete('/:goalId', (req, res) => {
        const userId = req.userId;
        const {goalId} = req.params;

        console.log(`Deleting goal ID: ${goalId} for user ID: ${userId}`); // Debug log

        db.run(
            `DELETE
             FROM goals
             WHERE id = ?
               AND user_id = ?`,
            [goalId, userId],
            function (err) {
                if (err) {
                    console.error('Error deleting goal:', err.message);
                    return res.status(500).json({error: 'Server error while deleting goal'});
                }

                if (this.changes === 0) {
                    return res.status(404).json({error: 'Goal not found'});
                }

                console.log('Goal deleted successfully:', {goalId});
                res.json({success: true, message: 'Goal deleted successfully'});
            }
        );
    });

    return router;
};
