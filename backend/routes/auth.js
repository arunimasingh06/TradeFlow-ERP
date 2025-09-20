// routes/auth.js
// Handles all authentication-related API endpoints (signup, login)

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const User = require('../models/User');
const { requireAuth } = require('../middlewares/jwtAuth');

const router = express.Router();

// Use environment variable for JWT secret; never hardcode in production
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';

// Rate limiters specifically for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

// Password policy: > 8 chars, one lowercase, one uppercase, one number, one special
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{9,}$/;

// --- SIGNUP ROUTE ---
// @route   POST /api/auth/signup
// @desc    Register a new user
router.post(
  '/signup',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('loginId')
      .trim()
      .isLength({ min: 6, max: 12 })
      .withMessage('Login ID must be 6-12 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .matches(passwordPolicy)
      .withMessage('Password must be >8 chars and include lower, upper, number, and special char'),
    body('reenteredPassword').custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, loginId, email, password } = req.body;

    try {
      // 1. Check if user already exists (by loginId or email)
      let user = await User.findOne({ $or: [{ loginId }, { email }] });
      if (user) {
        return res.status(400).json({ message: 'User with this Login ID or Email already exists.' });
      }

      // 2. Create and hash password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      // 3. Save user (role defaults to invoicing)
      user = new User({ name, loginId, email: email.toLowerCase(), password: hashed });
      await user.save();

      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
      console.error('Signup Error:', error);
      res.status(500).send('Server Error');
    }
  }
);

// --- LOGIN ROUTE ---
// @route   POST /api/auth/login
// @desc    Authenticate a user and get a token
router.post(
  '/login',
  authLimiter,
  [
    body('loginId').trim().notEmpty().withMessage('Login ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { loginId, password } = req.body;

    try {
      const user = await User.findOne({ loginId });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      const payload = { user: { id: user.id, name: user.name, role: user.role } };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err);
          return res.status(500).send('Server Error');
        }
        res.json({ message: 'Logged in successfully!', token });
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).send('Server Error');
    }
  }
);

// --- FORGOT PASSWORD (Placeholder) ---
// @route   POST /api/auth/forgot-password
// @desc    Handle forgot password requests
router.post(
  '/forgot-password',
  authLimiter,
  [body('loginId').trim().notEmpty().withMessage('Login ID is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { loginId } = req.body;
    const user = await User.findOne({ loginId });
    if (!user) {
      // Do not reveal if user exists
      return res.status(200).json({ message: 'If a user with that login ID exists, a password reset link has been sent.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await user.save();

    // TODO: Send email with token; for now return token for dev/testing
    return res.status(200).json({ message: 'Password reset link generated.', resetToken: token, expiresAt: expires });
  }
);

// Reset password (consume token)
router.post(
  '/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .matches(passwordPolicy)
      .withMessage('Password must be >8 chars and include lower, upper, number, and special char'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { token, password } = req.body;
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  }
);

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
});

module.exports = router;
