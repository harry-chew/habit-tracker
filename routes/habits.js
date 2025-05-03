const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const Streak = require('../models/Streak');
const { ensureAuthenticated } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateHabit = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Habit name must be between 1 and 100 characters')
    .escape(),
  body('description')
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters')
    .escape(),
];

router.get('/add', ensureAuthenticated, (req, res) => {
  const isMobile = req.useragent.isMobile;
  console.log('Add Habit route UserId:', req.user.id); // Log the user ID for debugging
  res.render('add-habit', { user: req.user, isMobile, errors: [], formData: {} });
});

router.post('/add', ensureAuthenticated, validateHabit, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('add-habit', {
      user: req.user,
      isMobile: req.useragent.isMobile,
      errors: errors.array(),
      formData: req.body // Pass the form data back to pre-fill the form
    });
  }
  
  try {
    const { name, description } = req.body;
    // Create new habit
    const newHabit = new Habit({
      userId: req.user.id,
      name,
      description
    });
    await newHabit.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).render('add-habit', {
      user: req.user,
      isMobile: req.useragent.isMobile,
      errors: [{ msg: 'Server error occurred. Please try again.' }],
      formData: req.body
    });
  }
});

router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
    const isMobile = req.useragent.isMobile;
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