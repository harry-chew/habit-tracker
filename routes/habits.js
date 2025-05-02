const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const Streak = require('../models/Streak');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/add', ensureAuthenticated, (req, res) => {
  console.log('Add Habit route UserId:', req.user.id); // Log the user ID for debugging
  res.render('add-habit', { user: req.user });
});

router.post('/add', ensureAuthenticated, async (req, res) => {
  try {
    const newHabit = new Habit({
      userId: req.user.id,
      name: req.body.name,
      description: req.body.description,
      frequency: req.body.frequency
    });
    await newHabit.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
    try {
      await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
});

router.post('/complete/:id', ensureAuthenticated, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });
    if (!habit) {
      return res.status(404).send('Habit not found');
    }
    
    const now = new Date();
    habit.lastCompletedDate = now;
    await habit.save();

    // Update streak
    let streak = await Streak.findOne({ userId: req.user.id });
    if (!streak) {
      streak = new Streak({ userId: req.user.id });
    }

    const allHabits = await Habit.find({ userId: req.user.id });
    const allCompleted = allHabits.every(h => h.isCompletedForCurrentPeriod());

    if (allCompleted) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        streak.currentStreak += 1;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        streak.history.push({ date: today, streak: streak.currentStreak });
    }
    
    streak.lastUpdated = now;
    await streak.save();
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;