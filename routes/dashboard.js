const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const Streak = require('../models/Streak');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, async (req, res) => {
  console.log('Dashboard route - Session ID:', req.sessionID);
  console.log('Dashboard route - User:', JSON.stringify(req.user, null, 2));
  console.log('Dashboard route UserId:', req.user ? req.user.id : 'No user');


  try {
    const habits = await Habit.find({ userId: req.user.id });
    const streak = await Streak.findOne({ userId: req.user.id });
    
    console.log('Dashboard route - Habits found:', habits.length);
    console.log('Dashboard route - Streak:', streak ? 'Found' : 'Not found');


    const allCompleted = habits.every(habit => habit.isCompletedForCurrentPeriod());
    const hasSevenDayStreak = streak && streak.hasSevenDayStreak();
    const showBanner = allCompleted && hasSevenDayStreak;

    console.log('Dashboard route - All habits completed:', allCompleted);
    console.log('Dashboard route - Has seven day streak:', hasSevenDayStreak);
    console.log('Dashboard route - Show banner:', showBanner);

    res.render('dashboard', { 
      user: req.user, 
      habits,
      showBanner
    });
  } catch (err) {
    console.error(err);
    console.error('Dashboard route - Error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;