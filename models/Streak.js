const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  history: [{
    date: { type: Date },
    streak: { type: Number }
  }]
});

module.exports = mongoose.model('Streak', streakSchema);