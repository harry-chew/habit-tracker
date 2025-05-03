const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require('mongoose');
const util = require('util');
const cookieParser = require('cookie-parser');
const { ensureAuthenticated } = require('./middleware/auth');
const useragent = require('express-useragent');
const { PostHog } = require('posthog-node');
const { posthogMiddleware } = require('./middleware/posthog');

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
app.use(useragent.express());

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

const client = new PostHog(process.env.POSTHOG_API_KEY, {
  host: 'https://eu.i.posthog.com',
  persistence: 'memory', // Use in-memory persistence for testing
  person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
});

// Routes that don't require authentication
app.use('/auth', posthogMiddleware, authRoutes);

// Home route
app.get('/', (req, res) => {
  const token = req.cookies?.jwt;
  const isMobile = req.useragent.isMobile;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      return res.redirect('/dashboard', { isMobile});
    } catch (error) {
      console.error(`Error: ${error}`);
      res.clearCookie('jwt');
    }
  }
  res.render('index', { user: null, isMobile });
});

// Apply ensureAuthenticated middleware to routes that require authentication
app.use('/habits', ensureAuthenticated, posthogMiddleware, habitRoutes);
app.use('/dashboard', ensureAuthenticated, posthogMiddleware, dashboardRoutes);
app.use('/stats', ensureAuthenticated, posthogMiddleware, statsRoutes);
app.use('/feedback', ensureAuthenticated, posthogMiddleware, feedbackRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch(err => console.error('Could not connect to MongoDB', err));

app.on('close', async () => {
  await client.shutdown()
});