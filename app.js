const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require('mongoose');
const util = require('util');
const cookieParser = require('cookie-parser');
const { ensureAuthenticated } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const dashboardRoutes = require('./routes/dashboard');
const statsRoutes = require('./routes/stats');
const feedbackRoutes = require('./routes/feedback');

const app = express();

// Set up EJS template engine and views directory
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Middleware
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());

// Passport Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI
},
(accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    displayName: profile.displayName,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName
  };
  return done(null, user);
}
));

// Add this debugging middleware before your routes
app.use((req, res, next) => {
  console.log('Debug Middleware - Request URL:', req.url);
  console.log('Debug Middleware - User:', util.inspect(req.user, { depth: null }));
  next();
});

// Routes that don't require authentication
app.use('/auth', authRoutes);

// Home route
app.get('/', (req, res) => {
  const token = req.cookies?.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (error) {
      res.clearCookie('jwt');
    }
  }
  res.render('index', { user: null });
});

// Apply ensureAuthenticated middleware to routes that require authentication
app.use('/habits', ensureAuthenticated, habitRoutes);
app.use('/dashboard', ensureAuthenticated, dashboardRoutes);
app.use('/stats', ensureAuthenticated, statsRoutes);
app.use('/feedback', ensureAuthenticated, feedbackRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch(err => console.error('Could not connect to MongoDB', err));