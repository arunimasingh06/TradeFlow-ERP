import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const SignIn = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock login logic - replace with actual authentication
      if (formData.email && formData.password) {
        const mockUser = {
          id: '1',
          name: 'Shiv Kumar',
          email: formData.email,
          role: 'admin' // This would come from API response
        };
        login(mockUser);
      } else {
        setError('Please enter valid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            Welcome Back
          </motion.h1>
          <p className="text-gray-300" style={{color: 'var(--text-secondary)'}}>
            Sign in to Shiv Furnitures Management System
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
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <label className="text-white text-sm font-medium flex items-center mb-3" style={{color: 'var(--text-primary)'}}>
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </label>
              <motion.input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white py-4 px-4 rounded-xl focus:border-gray-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-gray-300"
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <label className="text-white text-sm font-medium flex items-center mb-3" style={{color: 'var(--text-primary)'}}>
                <Lock className="w-4 h-4 mr-2" />
                Password
              </label>
              <div className="relative">
                <motion.input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white py-4 px-4 pr-12 rounded-xl focus:border-gray-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-gray-300"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-gray-300" style={{color: 'var(--text-secondary)'}}>
                  Remember me
                </span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium hover:underline transition-colors"
                style={{color: 'var(--primary-light)'}}
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-200 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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
                <span className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </span>
              )}
            </motion.button>

            {/* Quick Login Options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-3" style={{color: 'var(--text-muted)'}}>
                  Quick Login Options:
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  type="button"
                  onClick={() => setFormData({ email: 'admin@shiv.com', password: 'admin123' })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-3 text-xs rounded-lg bg-white/5 border border-white/20 text-gray-300 hover:bg-white/10 transition-all"
                >
                  Admin
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setFormData({ email: 'accountant@shiv.com', password: 'acc123' })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-3 text-xs rounded-lg bg-white/5 border border-white/20 text-gray-300 hover:bg-white/10 transition-all"
                >
                  Accountant
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setFormData({ email: 'client@shiv.com', password: 'client123' })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-3 text-xs rounded-lg bg-white/5 border border-white/20 text-gray-300 hover:bg-white/10 transition-all"
                >
                  Client
                </motion.button>
              </div>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center pt-4"
            >
              <p className="text-gray-300" style={{color: 'var(--text-secondary)'}}>
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="font-medium hover:underline transition-colors"
                  style={{color: 'var(--primary-light)'}}
                >
                  Sign Up
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

export default SignIn;
