const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  createdAt: { type: Date, default: Date.now },
  completions: [{ type: Date }],
  streak: { type: Number, default: 0 },
  lastCompletedDate: { type: Date }
});

habitSchema.methods.isCompletedForCurrentPeriod = function() {
  const now = new Date();
  let startOfPeriod;

  switch (this.frequency) {
    case 'daily':
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      break;
    case 'monthly':
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }
  
  // For daily habits, check if the last completion is after the start of the current day
  if (this.frequency === 'daily') {
    return this.lastCompletedDate && this.lastCompletedDate >= startOfPeriod;
  }

  return this.completions.some(date => date >= startOfPeriod && date <= now);
};

module.exports = mongoose.model('Habit', habitSchema);