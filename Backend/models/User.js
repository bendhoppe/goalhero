const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
/*
// Register route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    console.log('Registration request received'); // Log when registration is requested

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        console.log(`User ${username} already exists`); // Log when user already exists
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    try {
        await newUser.save();
        console.log(`User ${username} created successfully`); // Log when user is created successfully
        res.status(201).json({ message: "User created successfully!" });
    } catch (error) {
        console.error('Error registering user:', error); // Log any errors during registration
        res.status(500).json({ message: "Error registering user" });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('Login request received for username:', username); // Log when login is requested

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
        console.log(`User ${username} not found`); // Log if user is not found
        return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log(`Invalid password attempt for user ${username}`); // Log invalid password attempt
        return res.status(400).json({ message: "Invalid password" });
    }

    // Generate a JWT (optional, if using tokens for sessions)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log(`Login successful for user ${username}`); // Log successful login
    res.status(200).json({ message: "Login successful", token });
});

module.exports = router;
*/