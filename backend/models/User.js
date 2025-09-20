const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  loginId: {
    type: String,
    required: true,
    unique: true, // Ensures no two users have the same login ID
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no two users have the same email
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  // Default role per UI note: only 'invoicing' users created from signup
  role: {
    type: String,
    enum: ['invoicing', 'admin'],
    default: 'invoicing'
  },
  // Password reset (forgot password) support
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  }
}, {
  // Automatically add 'createdAt' and 'updatedAt' fields
  timestamps: true
});


module.exports = mongoose.model('User', UserSchema);