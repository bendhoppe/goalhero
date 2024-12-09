// userControllers.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = ({ username, password, db }, callback) => {
    console.log('DB Object in controller:', db);

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return callback(err); // Pass the error to the callback
        }

        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';

        // Use the db connection passed from the route
        db.run(query, [username, hashedPassword], function (err) {
            if (err) {
                return callback(err); // Pass the error to the callback
            }

            // Pass the result to the callback (user ID and username)
            callback(null, { id: this.lastID, username });
        });
    });
};

//Login user
exports.loginUser = ({ username, password, db }, callback) => {
    console.log('LoginUser called with:', { username });

    const query = 'SELECT * FROM users WHERE username = ?';
    db.get(query, [username], (err, user) => {
        if (err) {
            console.error('Database error:', err); // Log database errors
            return callback(err);
        }

        if (!user) {
            console.warn('User not found:', username); // Log if the user is not found
            return callback(null, { error: 'User not found' });
        }

        // Compare the password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Password comparison error:', err); // Log bcrypt errors
                return callback(err);
            }

            if (!isMatch) {
                console.warn('Invalid password for user:', username); // Log invalid password attempts
                return callback(null, { error: 'Invalid credentials' });
            }

            // Generate a JWT token
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            callback(null, { message: 'Login successful', token });
        });
    });
};


