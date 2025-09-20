const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;


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

// Authorization: ensure authenticated user has a specific role
function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!req.user.role) return res.status(403).json({ message: 'Forbidden' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Insufficient role' });
    return next();
  };
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
  requireRole,
};
