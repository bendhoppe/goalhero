// journalController.js
exports.create = (req, res) => {
    const { title, description } = req.body;
    const userId = req.userId; // Getting the userId from the authenticated token

    const query = `INSERT INTO journal_entries (user_id, title, description) VALUES (?, ?, ?)`;
    db.run(query, [userId, title, description], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.status(201).json({ success: true, entryId: this.lastID });
    });
};

exports.getAll = (req, res) => {
    const userId = req.userId; // Getting the userId from the authenticated token

    const query = `SELECT * FROM journal_entries WHERE user_id = ?`;
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json(rows);
    });
};

exports.delete = (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM journal_entries WHERE id = ?`;

    db.run(query, [id], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true });
    });
};
