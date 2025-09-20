const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate Customer Portal tokens
// Expects Authorization: Bearer <token> where token has { sub: customerId, purpose: 'portal' }
module.exports.requirePortalAuth = (req, res, next) => {
  try {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing portal token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.purpose !== 'portal') return res.status(401).json({ message: 'Invalid portal token' });
    req.portal = { customerId: decoded.sub };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired portal token' });
  }
};
