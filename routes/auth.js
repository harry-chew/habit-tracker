const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('User:', req.user);
    console.log('Session:', req.session);
    res.redirect('/dashboard');
  }
);

router.get('/login', (req, res) => {
  res.send('Login failed. <a href="/">Try again</a>');
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;