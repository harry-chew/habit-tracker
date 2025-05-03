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
    // Manually handle the session
    req.session.passport = { user: req.user };
    
    console.log('Google callback - User authenticated:', util.inspect(req.user, { depth: null }));
    console.log('Google callback - Session:', util.inspect(req.session, { depth: null }));
    
    res.redirect('/dashboard');
  }
);

router.get('/login', (req, res) => {
  res.send('Login failed. <a href="/">Try again</a>');
});

router.get('/logout', (req, res) => {
  req.session = null;  // This destroys the session
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;