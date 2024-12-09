const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

module.exports = (db) => {
    console.log('DB Object in route:', db);

    // Register route
    router.post('/register', (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        userController.registerUser({ username, password, db }, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Registration failed: ' + err.message });
            }
            res.status(201).json({ message: 'Registration successful', userId: result.id });
        });
    });

    // Login route
    router.post('/login', (req, res) => {
        const { username, password } = req.body;

        console.log('Login request received:', { username, password });

        if (!username || !password) {
            console.error('Missing username or password');
            return res.status(400).json({ error: 'Username and password are required' });
        }

        userController.loginUser({ username, password, db }, (err, result) => {
            if (err) {
                console.error('Error during loginUser:', err); // Log the actual error
                return res.status(500).json({ error: 'Login failed: ' + err.message });
            }

            if (result.error) {
                console.warn('Login failed:', result.error);
                return res.status(400).json({ error: result.error });
            }

            res.json({ message: result.message, token: result.token });
        });
    });


    // Route to create a goal
    router.post('/goals', (req, res) => {
        const { title, description, entryId, totalUnits } = req.body;
        const userId = req.user.id;

        if (!title || !description || !entryId || !totalUnits) {
            return res.status(400).json({ error: 'Title, description, entryId, and totalUnits are required' });
        }

        const query = 'INSERT INTO goals (user_id, entry_id, title, description, total_units) VALUES (?, ?, ?, ?, ?)';
        db.run(query, [userId, entryId, title, description, totalUnits], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error creating goal: ' + err.message });
            }
            res.status(201).json({ message: 'Goal created', goalId: this.lastID });
        });
    });

    // Route to create a habit
    router.post('/habits', (req, res) => {
        const { name, frequency, goalId } = req.body;
        const userId = req.user.id;

        if (!name || !frequency || !goalId) {
            return res.status(400).json({ error: 'Name, frequency, and goalId are required' });
        }

        const query = 'INSERT INTO habits (user_id, goal_id, name, frequency) VALUES (?, ?, ?, ?)';
        db.run(query, [userId, goalId, name, frequency], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error creating habit: ' + err.message });
            }
            res.status(201).json({ message: 'Habit created', habitId: this.lastID });
        });
    });

    return router;
};
