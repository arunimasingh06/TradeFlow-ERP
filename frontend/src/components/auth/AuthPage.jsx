import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, User, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    loginId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldValidation, setFieldValidation] = useState({});
  const { login } = useAuth();

  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      icon: Shield,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500',
      description: 'Full system access and management'
    },
    {
      id: 'accountant',
      name: 'Accountant',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500',
      description: 'Financial data and reporting access'
    },
    {
      id: 'contact',
      name: 'Client',
      icon: User,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500',
      description: 'Client portal and basic features'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    const validation = { ...fieldValidation };
    
    switch (fieldName) {
      case 'name':
        validation.name = value.length >= 2;
        break;
      case 'loginId':
        validation.loginId = value.length >= 6 && value.length <= 12;
        break;
      case 'email':
        validation.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'password':
        const hasLower = /[a-z]/.test(value);
        const hasUpper = /[A-Z]/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        validation.password = value.length >= 8 && hasLower && hasUpper && hasSpecial;
        break;
      case 'confirmPassword':
        validation.confirmPassword = value === formData.password;
        break;
    }
    
    setFieldValidation(validation);
  };

  const validateForm = () => {
    if (isSignUp) {
      if (!selectedRole) {
        setError('Please select your role');
        return false;
      }
      if (!formData.name || formData.name.length < 2) {
        setError('Name must be at least 2 characters long');
        return false;
      }
      if (!formData.loginId || formData.loginId.length < 6 || formData.loginId.length > 12) {
        setError('Login ID must be between 6-12 characters');
        return false;
      }
      if (!formData.email || !fieldValidation.email) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.password || !fieldValidation.password) {
        setError('Password must be at least 8 characters with uppercase, lowercase and special character');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    } else {
      if (!formData.loginId && !formData.email) {
        setError('Please enter login ID or email');
        return false;
      }
      if (!formData.password) {
        setError('Please enter password');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isSignUp) {
        // For signup, use selected role
        login(formData.email, formData.password, selectedRole);
      } else {
        // For signin, determine role from identifier
        const identifier = formData.loginId || formData.email;
        const role = identifier.includes('admin') ? 'admin' : 
                    identifier.includes('accountant') ? 'accountant' : 'contact';
        login(identifier, formData.password, role);
      }
    } catch (err) {
      setError(isSignUp ? 'Signup failed. Please try again.' : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSelectedRole('');
    setFieldValidation({});
    setFormData({
      name: '',
      loginId: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const getValidationIcon = (fieldName) => {
    if (!formData[fieldName]) return null;
    const isValid = fieldValidation[fieldName];
    return isValid ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-light text-white mb-2 tracking-wide">
            Welcome to Shiv Furnitures
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Your Furniture Business Management Platform
          </p>
        </motion.div>

        {/* Role Selection - Only for Sign Up */}
        <AnimatePresence>
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <p className="text-white text-sm font-medium mb-4 text-center">Choose your role</p>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role, index) => {
                  const Icon = role.icon;
                  return (
                    <motion.button
                      key={role.id}
                      type="button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        selectedRole === role.id
                          ? `${role.borderColor} ${role.bgColor} shadow-lg`
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      }`}
                    >
                      <div className={`w-8 h-8 mx-auto mb-2 p-1.5 rounded-lg bg-gradient-to-r ${role.color}`}>
                        <Icon className="w-full h-full text-white" />
                      </div>
                      <p className="text-white text-xs font-medium">{role.name}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field - Only for Sign Up */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-lg text-sm font-medium mr-3">
                        User
                      </div>
                      <label className="text-white text-lg font-light">Full Name</label>
                    </div>
                    {getValidationIcon('name')}
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b-2 border-gray-600 text-white text-lg py-3 focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-500"
                    placeholder="Enter your full name"
                    required={isSignUp}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login ID Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-white text-lg font-light">
                  {isSignUp ? 'Login ID' : 'Login ID or Email'}
                </label>
                {!isSignUp && getValidationIcon('loginId')}
              </div>
              <input
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b-2 border-gray-600 text-white text-lg py-3 focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-500"
                placeholder={isSignUp ? "6-12 characters" : "Enter login ID or email"}
                required={!isSignUp || !formData.email}
              />
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-white text-lg font-light">Email Address</label>
                {getValidationIcon('email')}
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b-2 border-gray-600 text-white text-lg py-3 focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-500"
                placeholder="Enter your email address"
                required={isSignUp}
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-white text-lg font-light">Password</label>
                <div className="flex items-center space-x-2">
                  {getValidationIcon('password')}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b-2 border-gray-600 text-white text-lg py-3 focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-500"
                placeholder={isSignUp ? "8+ chars, uppercase, lowercase, special" : "Enter your password"}
                required
              />
            </motion.div>

            {/* Confirm Password Field - Only for Sign Up */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm font-medium mr-3">
                        Confirm
                      </div>
                      <label className="text-white text-lg font-light">Re-Enter Password</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getValidationIcon('confirmPassword')}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b-2 border-gray-600 text-white text-lg py-3 focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-500"
                    placeholder="Confirm your password"
                    required={isSignUp}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-900/30 backdrop-blur-sm border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center pt-4"
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden px-12 py-4 rounded-2xl text-lg font-medium transition-all duration-300 min-w-[160px] ${
                  selectedRole && isSignUp
                    ? `bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color} text-white shadow-lg`
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  <span className="relative z-10">
                    {isSignUp ? '🚀 Create Account' : '👋 Welcome Back'}
                  </span>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Toggle Mode */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 pt-6 border-t border-gray-700/50"
          >
            <p className="text-gray-400 text-sm mb-3">
              {isSignUp ? 'Already have an account?' : 'New to our platform?'}
            </p>
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-400 hover:text-blue-300 transition-all duration-300 text-sm font-medium hover:underline"
            >
              {isSignUp ? '← Sign In Instead' : '→ Create New Account'}
            </button>
          </motion.div>

          {/* Quick Demo Access - Only for Sign In */}
          {!isSignUp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 pt-4 border-t border-gray-700/50"
            >
              <p className="text-gray-400 text-xs text-center mb-3">Quick Demo Access:</p>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <motion.button
                      key={role.id}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          loginId: `${role.id}@demo.com`,
                          password: 'Demo123!'
                        });
                        setTimeout(() => {
                          login(`${role.id}@demo.com`, 'Demo123!', role.id);
                        }, 500);
                      }}
                      className={`p-3 rounded-xl border transition-all duration-300 ${role.bgColor} ${role.borderColor} hover:shadow-lg`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1 text-white" />
                      <p className="text-white text-xs font-medium">{role.name}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Instructions - Only show for Sign Up */}
        <AnimatePresence>
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 mt-6 border border-gray-700/30"
            >
              <h3 className="text-white font-medium mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Account Creation Guidelines
              </h3>
              <div className="text-gray-400 text-sm space-y-2">
                <p>• <strong>Login ID:</strong> Must be unique, 6-12 characters</p>
                <p>• <strong>Email:</strong> Must be unique in our database</p>
                <p>• <strong>Password:</strong> 8+ characters with uppercase, lowercase & special character</p>
                <p>• <strong>Role:</strong> Choose based on your access requirements</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;
