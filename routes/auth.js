const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    console.log('✅ Google login successful, redirecting to dashboard');
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