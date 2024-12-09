const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

module.exports = (db) => {

    // Get all journal entries for the logged-in user
    router.get('/', authenticateToken, (req, res) => {
        const userId = req.userId;
        db.all('SELECT * FROM journal_entries WHERE user_id = ?', [userId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // Create a new journal entry
    router.post('/', authenticateToken, (req, res) => {
        const { title, description } = req.body;
        const userId = req.userId;

        console.log('Creating journal entry:', { userId, title, description });

        db.run('INSERT INTO journal_entries (user_id, title, description) VALUES (?, ?, ?)',
            [userId, title, description],
            function (err) {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).json({ error: 'Database error: ' + err.message });
                }
                console.log('Journal entry created with ID:', this.lastID);
                res.status(201).json({ entryId: this.lastID });
            }
        );
    });

    // Update a journal entry
    router.put('/:id', authenticateToken, (req, res) => {
        const { title, description } = req.body;
        const { id } = req.params;
        const userId = req.userId;

        db.run('UPDATE journal_entries SET title = ?, description = ? WHERE id = ? AND user_id = ?',
            [title, description, id, userId], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
    });

    // Delete a journal entry
    router.delete('/:id', authenticateToken, (req, res) => {
        const { id } = req.params;
        const userId = req.userId;

        db.run('DELETE FROM journal_entries WHERE id = ? AND user_id = ?', [id, userId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });

    return router;
};
