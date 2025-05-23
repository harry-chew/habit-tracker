const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const Streak = require('../models/Streak');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/');
    }

    const habits = await Habit.find({ userId: req.user.id });
    const streak = await Streak.findOne({ userId: req.user.id });

    const allCompleted = habits.every(habit => habit.isCompletedForCurrentPeriod());
    const hasSevenDayStreak = streak && streak.hasSevenDayStreak();
    const showBanner = allCompleted && hasSevenDayStreak;

    const isMobile = req.useragent.isMobile;

    res.render('dashboard', { 
      user: req.user, 
      habits,
      showBanner,
      isMobile
    });
  } catch (err) {
    console.error(err);
    console.error('Dashboard route - Error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;