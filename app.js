const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
const mongoose = require('mongoose');
const util = require('util');
const cookieSession = require('cookie-session');

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

// Replace the existing session middleware with this
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax'
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

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
  console.log('Debug Middleware - Session:', util.inspect(req.session, { depth: null }));
  console.log('Debug Middleware - User:', util.inspect(req.user, { depth: null }));
  console.log('Debug Middleware - isAuthenticated:', req.isAuthenticated());
  next();
});

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    console.log('User is authenticated:', req.user);
    res.redirect('/dashboard');
  } else {
    console.log('User is not authenticated');
    res.render('index', { user: req.user });
  }
  //res.render('index', { user: req.user });
});

// Use route files
app.use('/auth', authRoutes);
app.use('/habits', habitRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/stats', statsRoutes);
app.use('/feedback', feedbackRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
})
.catch(err => console.error('Could not connect to MongoDB', err));

