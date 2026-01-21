const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[OptionalAuth] Decoded:', decoded);
    req.user = decoded;
  } catch (err) {
    console.log('[OptionalAuth] Token verification failed:', err.message);
    return next();
  }

  return next();
};
