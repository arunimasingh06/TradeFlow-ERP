const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';

// Strict auth: request must include a valid token
function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // { id, name, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Optional auth: if token exists and valid, attach req.user; otherwise continue
function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    // Ignore invalid token and proceed as unauthenticated
    return next();
  }
}

// Utility: Extract Bearer token from headers or cookie
function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (req.headers['x-auth-token']) {
    return req.headers['x-auth-token'];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

module.exports = {
  requireAuth,
  optionalAuth,
};
