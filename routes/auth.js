const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const util = require('util');

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    console.log('Google callback - User authenticated:', util.inspect(req.user, { depth: null }));
    
    // Generate JWT
    const token = jwt.sign(req.user, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    // Set JWT as cookie
    res.cookie('jwt', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.redirect('/dashboard');
  }
);

router.get('/login', (req, res) => {
  res.send('Login failed. <a href="/">Try again</a>');
});

router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

module.exports = router;