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

// Add this method to the Streak schema
streakSchema.methods.hasSevenDayStreak = function() {
  return this.currentStreak >= 7;
};

module.exports = mongoose.model('Streak', streakSchema);