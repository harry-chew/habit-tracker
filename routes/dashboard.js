const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    const habitsWithStatus = habits.map(habit => ({
      ...habit.toObject(),
      isCompleted: habit.isCompletedForCurrentPeriod()
    }));
    res.render('dashboard', { user: req.user, habits: habitsWithStatus });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;