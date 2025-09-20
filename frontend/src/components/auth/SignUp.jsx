import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});

  const validateField = (fieldName, value) => {
    const validation = { ...fieldValidation };
    
    switch (fieldName) {
      case 'name':
        validation.name = value.length >= 2;
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
        validation.confirmPassword = value === formData.password && value.length > 0;
        break;
    }
    
    setFieldValidation(validation);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    validateField(name, value);
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    // Handle signup logic here
  };

  const getValidationIcon = (fieldName) => {
    if (!formData[fieldName]) return null;
    const isValid = fieldValidation[fieldName];
    return isValid ? 
      <CheckCircle className="w-5 h-5 text-green-400" /> : 
      <XCircle className="w-5 h-5 text-red-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-gray-600/20 to-gray-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-gray-500/20 to-gray-700/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <motion.h1 
            className="text-white text-4xl font-bold mb-3"
            style={{color: 'var(--text-primary)'}}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Create Account
          </motion.h1>
          <p className="text-gray-300" style={{color: 'var(--text-secondary)'}}>
            Join Shiv Furnitures Management System
          </p>
        </motion.div>

        {/* Main Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden"
          whileHover={{ 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            scale: 1.01
          }}
        >
          {/* Animated Border Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-500/20 via-gray-400/20 to-gray-600/20 blur-sm -z-10" />
          
          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-white text-sm font-medium flex items-center" style={{color: 'var(--text-primary)'}}>
                  <User className="w-4 h-4 mr-2" />
                  Full Name
                </label>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: fieldValidation.name ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {getValidationIcon('name')}
                </motion.div>
              </div>
              <motion.input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white py-3 px-4 rounded-xl focus:border-gray-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-gray-300"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Enter your full name"
                required
                whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(107, 114, 128, 0.3)" }}
              />
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-white text-sm font-medium flex items-center" style={{color: 'var(--text-primary)'}}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </label>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: fieldValidation.email ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {getValidationIcon('email')}
                </motion.div>
              </div>
              <motion.input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white py-3 px-4 rounded-xl focus:border-gray-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-gray-300"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Enter your email"
                required
                whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(107, 114, 128, 0.3)" }}
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-white text-sm font-medium flex items-center" style={{color: 'var(--text-primary)'}}>
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </label>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: fieldValidation.password ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {getValidationIcon('password')}
                </motion.div>
              </div>
              <div className="relative">
                <motion.input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white py-3 px-4 pr-12 rounded-xl focus:border-gray-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-gray-300"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="8+ chars, uppercase, lowercase, special"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(107, 114, 128, 0.3)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-white text-sm font-medium flex items-center" style={{color: 'var(--text-primary)'}}>
                  <Lock className="w-4 h-4 mr-2" />
                  Confirm Password
                </label>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: fieldValidation.confirmPassword ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {getValidationIcon('confirmPassword')}
                </motion.div>
              </div>
              <div className="relative">
                <motion.input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white py-3 px-4 pr-12 rounded-xl focus:border-gray-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-gray-300"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Confirm your password"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(107, 114, 128, 0.3)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(44, 44, 44, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 rounded-xl text-white font-medium text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{
                backgroundColor: 'var(--primary)',
                borderColor: 'var(--primary-light)'
              }}
            >
              {isLoading ? (
                <motion.div 
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                'Create Account'
              )}
            </motion.button>

            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center pt-4"
            >
              <p className="text-gray-300" style={{color: 'var(--text-secondary)'}}>
                Already have an account?{' '}
                <Link 
                  to="/signin" 
                  className="font-medium hover:underline transition-colors"
                  style={{color: 'var(--primary-light)'}}
                >
                  Sign In
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-6"
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
            style={{color: 'var(--text-muted)'}}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUp;
