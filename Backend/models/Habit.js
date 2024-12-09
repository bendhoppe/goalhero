/*
const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    title: { type: String, required: true },
    implementationPlan: {
        time: String,
        trigger: String,
        obstacle: String,
        solution: String
    },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Habit', HabitSchema);
*/