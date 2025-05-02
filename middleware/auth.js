function ensureAuthenticated(req, res, next) {
  console.log('ensureAuthenticated - Session:', req.session);
  console.log('ensureAuthenticated - User:', req.user);
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = { ensureAuthenticated };