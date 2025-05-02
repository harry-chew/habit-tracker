const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const Streak = require('../models/Streak');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, async (req, res) => {
  console.log('Dashboard route - Session:', req.session);
  console.log('Dashboard route - User:', req.user);
  console.log('Dashboard route UserId:', req.user ? req.user.id : 'No user');

  try {
    const habits = await Habit.find({ userId: req.user.id });
    const streak = await Streak.findOne({ userId: req.user.id });
    
    const allCompleted = habits.every(habit => habit.isCompletedForCurrentPeriod());
    const hasSevenDayStreak = streak && streak.hasSevenDayStreak();
    const showBanner = allCompleted && hasSevenDayStreak;

    res.render('dashboard', { 
      user: req.user, 
      habits,
      showBanner
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;