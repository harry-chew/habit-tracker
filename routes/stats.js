const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const Streak = require('../models/Streak');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, async (req, res) => {
  console.log('Stats route UserId:', req.user.id); // Log the user ID for debugging
  try {
    const habits = await Habit.find({ userId: req.user.id });
    const streak = await Streak.findOne({ userId: req.user.id });
    
    const totalHabits = habits.length;
    const completedToday = habits.filter(habit => habit.isCompletedForCurrentPeriod()).length;
    
    const currentStreak = streak ? streak.currentStreak : 0;
    const longestStreak = streak ? streak.longestStreak : 0;

    res.render('stats', { 
      user: req.user, 
      totalHabits, 
      completedToday, 
      currentStreak, 
      longestStreak 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;