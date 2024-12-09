/*
const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    targetDate: Date,
    habits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Habit' }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Goal', GoalSchema);
*/