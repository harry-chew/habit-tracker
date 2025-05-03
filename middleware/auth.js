const jwt = require('jsonwebtoken');

exports.ensureAuthenticated = (req, res, next) => {
  const token = req.cookies?.jwt;
  
  if (!token) {
    return res.redirect('/');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.clearCookie('jwt');
    res.redirect('/');
  }
};