const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  createdAt: { type: Date, default: Date.now },
  completions: [{ type: Date }],
  lastCompletedDate: { type: Date }
});

habitSchema.methods.isCompletedForCurrentPeriod = function() {
  if (!this.lastCompletedDate) return false;

  const now = new Date();
  const lastCompleted = new Date(this.lastCompletedDate);

  // Set both dates to the start of their respective days
  now.setHours(0, 0, 0, 0);
  lastCompleted.setHours(0, 0, 0, 0);

  switch (this.frequency) {
    case 'daily':
      return now.getTime() === lastCompleted.getTime();
    case 'weekly':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return lastCompleted >= weekStart;
    case 'monthly':
      return now.getMonth() === lastCompleted.getMonth() && 
             now.getFullYear() === lastCompleted.getFullYear();
    default:
      return false;
  }
};

module.exports = mongoose.model('Habit', habitSchema);