function ensureAuthenticated(req, res, next) {
  console.log('ensureAuthenticated - Session:', req.session);
  console.log('ensureAuthenticated - User:', req.user);
  console.log('ensureAuthenticated - isAuthenticated:', req.isAuthenticated && req.isAuthenticated());
  console.log('ensureAuthenticated - Headers:', req.headers);

  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = { ensureAuthenticated };