const express = require('express');
const passport = require('passport');
const router = express.Router();
const util = require('util');

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    console.log('Google callback - User authenticated:', util.inspect(req.user, { depth: null }));
    console.log('Google callback - Session before save:', util.inspect(req.session, { depth: null }));
    
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
      }
      console.log('Google callback - Session after save:', util.inspect(req.session, { depth: null }));
      res.redirect('/dashboard');
    });
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