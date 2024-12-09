const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();

// Get the absolute path of the 'database' folder and db file
const dbDir = path.join(__dirname, 'database');
const dbFile = path.join(dbDir, 'my_database.db');

// Ensure the 'database' folder exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Created database directory');
}

// Initialize SQLite database
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Set db globally for the app
app.set('db', db);

// Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Serve static files from the Frontend folder
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// Import routes after initializing app
const userRoutes = require('./routes/users')(db); // Pass db to routes
const goalRoutes = require('./routes/goals')(db); // Pass db to routes
const habitRoutes = require('./routes/habits')(db); // Pass db to routes
const journalEntriesRoutes = require('./routes/journal_entries');

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/habits', habitRoutes); // Add habits routes
app.use('/api/journal_entries', journalEntriesRoutes(db)); // Mounts at /api/journal_entries

// Serve the login.html when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Frontend', 'login.html'));
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Create tables if they don't exist
db.serialize(() => {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `);

    // Journal Entries table
    db.run(`
        CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);

    // Goals table
    db.run(`
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            entry_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            journal_entry TEXT,
            total_units INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (entry_id) REFERENCES journal_entries (id)
        )
    `);
    // Add the 'target_date' column to the existing 'goals' table
    db.run('ALTER TABLE goals ADD COLUMN target_date TEXT;', (err) => {
        if (err) {
            console.error('Error adding column:', err.message);
        } else {
            console.log('Column target_date added successfully.');
        }
    });

    // Add the 'progress' column to the existing 'goals' table
    db.run('ALTER TABLE goals ADD COLUMN progress FLOAT DEFAULT 0;', (err) => {
        if (err) {
            console.error('Error adding column:', err.message);
        } else {
            console.log('Column progress added successfully.');
        }
    });

    db.run('ALTER TABLE goals ADD COLUMN numerator INTEGER DEFAULT 0;', (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding column numerator:', err.message);
        } else {
            console.log('Column numerator added successfully.');
        }
    });



    // Habits table
    db.run(`
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            goal_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            frequency TEXT NOT NULL,
            progress INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (goal_id) REFERENCES goals (id)
        )
    `);

    // Habit weeks table
    db.run(`
        CREATE TABLE IF NOT EXISTS habit_weeks (
            habit_id INTEGER NOT NULL,
            week_start TEXT NOT NULL,
            checkboxes TEXT NOT NULL, -- JSON string to store checkbox states
            PRIMARY KEY (habit_id, week_start),
            FOREIGN KEY (habit_id) REFERENCES habits (id)
        )
    `);


    // Add new columns to the habits table
    db.serialize(() => {
        db.run('ALTER TABLE habits ADD COLUMN when_to_perform TEXT;', (err) => {
            if (err) {
                console.error('Error adding when_to_perform column:', err.message);
            } else {
                console.log('Column when_to_perform added successfully.');
            }
        });

        db.run('ALTER TABLE habits ADD COLUMN obstacle TEXT;', (err) => {
            if (err) {
                console.error('Error adding obstacle column:', err.message);
            } else {
                console.log('Column obstacle added successfully.');
            }
        });

        db.run('ALTER TABLE habits ADD COLUMN plan_to_overcome TEXT;', (err) => {
            if (err) {
                console.error('Error adding plan_to_overcome column:', err.message);
            } else {
                console.log('Column plan_to_overcome added successfully.');
            }
        });
    });

        db.run('ALTER TABLE habits ADD COLUMN title TEXT;', (err) => {
        if (err) {
            console.error('Error adding column to habits table:', err.message);
        } else {
            console.log('Column "title" added to the habits table.');
        }
    });

        db.run('ALTER TABLE habits ADD COLUMN description TEXT;', (err) => {
        if (err) {
            console.error('Error adding column "description" to habits table:', err.message);
        } else {
            console.log('Column "description" added to habits table.');
        }
    });

    db.run('ALTER TABLE habits ADD COLUMN goal_id INTEGER;', (err) => {
        if (err) {
            console.error('Error adding column "goal_id" to habits table:', err.message);
        } else {
            console.log('Column "goal_id" added to habits table.');
        }
    });


    });



