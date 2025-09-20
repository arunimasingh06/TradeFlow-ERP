import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Users, User, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const CreateUser = ({ onBack }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    loginId: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldValidation, setFieldValidation] = useState({});

  // Admin access control
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/50 text-red-300 px-6 py-4 rounded-xl text-center">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
          <p>Only administrators can create users.</p>
        </div>
      </div>
    );
  }

  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      icon: Shield,
      description: 'All access rights'
    },
    {
      id: 'accountant',
      name: 'Accountant',
      icon: Users,
      description: 'Invoicing user - he can not modify the master but can create'
    },
    {
      id: 'contact',
      name: 'Client',
      icon: User,
      description: 'User Rights'
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
    setError('');
    setSuccess('');
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
    if (!formData.role) {
      setError('Please select a role');
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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate user creation success
      setSuccess(`User "${formData.name}" created successfully!`);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          loginId: '',
          email: '',
          role: '',
          password: '',
          confirmPassword: ''
        });
        setFieldValidation({});
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError('Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      loginId: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: ''
    });
    setFieldValidation({});
    setError('');
    setSuccess('');
    if (onBack) onBack();
  };

  const getValidationIcon = (fieldName) => {
    if (!formData[fieldName]) return null;
    const isValid = fieldValidation[fieldName];
    return isValid ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  const selectedRole = roles.find(r => r.id === formData.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
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
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-5xl relative z-10"
      >
        {/* Header with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <motion.h1 
            className="text-white text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            ✨ Create User
          </motion.h1>
          <p className="text-blue-200 text-lg">Add new users to the system with style</p>
        </motion.div>

        {/* Main Form Container with Enhanced Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl relative overflow-hidden"
          whileHover={{ 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            scale: 1.01
          }}
        >
          {/* Animated Border Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm -z-10" />
          
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

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white text-lg font-medium flex items-center">
                    <span className="mr-2">👤</span>
                    Name
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
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white text-lg py-4 px-4 rounded-xl focus:border-blue-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-blue-200"
                  placeholder="Enter full name"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                />
              </motion.div>

              {/* Role Field */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white text-lg font-medium flex items-center">
                    <span className="mr-2">🎭</span>
                    Role
                  </label>
                  <span className="text-blue-200 text-sm">← Selection field</span>
                </div>
                <motion.select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white text-lg py-4 px-4 rounded-xl focus:border-blue-400 focus:bg-white/20 focus:outline-none transition-all duration-300"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                >
                  <option value="" className="bg-gray-800 text-white">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id} className="bg-gray-800 text-white">
                      {role.name}
                    </option>
                  ))}
                </motion.select>
              </motion.div>

              {/* Login ID Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white text-lg font-medium flex items-center">
                    <span className="mr-2">🔑</span>
                    Login ID
                  </label>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: fieldValidation.loginId ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {getValidationIcon('loginId')}
                  </motion.div>
                </div>
                <motion.input
                  type="text"
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white text-lg py-4 px-4 rounded-xl focus:border-blue-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-blue-200"
                  placeholder="6-12 characters"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white text-lg font-medium flex items-center">
                    <span className="mr-2">🔒</span>
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
                <motion.input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white text-lg py-4 px-4 rounded-xl focus:border-blue-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-blue-200"
                  placeholder="8+ chars, uppercase, lowercase, special"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                />
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white text-lg font-medium flex items-center">
                    <span className="mr-2">📧</span>
                    Email ID
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
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white text-lg py-4 px-4 rounded-xl focus:border-blue-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-blue-200"
                  placeholder="Enter email address"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                />
              </motion.div>

              {/* Re-Enter Password Field */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white text-lg font-medium flex items-center">
                    <span className="mr-2">🔐</span>
                    Re-Enter Password
                  </label>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: fieldValidation.confirmPassword ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {getValidationIcon('confirmPassword')}
                  </motion.div>
                </div>
                <motion.input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white text-lg py-4 px-4 rounded-xl focus:border-blue-400 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-blue-200"
                  placeholder="Confirm password"
                  required
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                />
              </motion.div>
            </div>

            {/* Loading/Status Indicator */}
            <motion.div 
              className="flex justify-center py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20"
                >
                  <motion.div 
                    className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full mr-3"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-blue-200 font-medium">✨ Creating Magic...</span>
                </motion.div>
              )}
            </motion.div>

            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-200 px-6 py-4 rounded-2xl text-sm flex items-center shadow-lg"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                </motion.div>
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-green-500/20 backdrop-blur-sm border border-green-400/50 text-green-200 px-6 py-4 rounded-2xl text-sm flex items-center shadow-lg"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                </motion.div>
                {success}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center space-x-6 pt-8"
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-2 border-green-400/50 text-white px-10 py-4 rounded-2xl text-lg font-medium hover:border-green-400 hover:from-green-500/30 hover:to-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center"
              >
                {isLoading ? (
                  <motion.div 
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <span className="flex items-center">
                    <span className="mr-2">✨</span>
                    Create
                  </span>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-red-400/50 text-white px-10 py-4 rounded-2xl text-lg font-medium hover:border-red-400 hover:from-red-500/30 hover:to-pink-500/30 transition-all disabled:opacity-50 min-w-[140px] flex items-center justify-center"
              >
                <span className="flex items-center">
                  <span className="mr-2">❌</span>
                  Cancel
                </span>
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* User Rights Information with Enhanced Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Guidelines */}
          <motion.div 
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl relative overflow-hidden"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl" />
            <div className="relative z-10">
              <h3 className="text-white font-bold mb-6 flex items-center text-xl">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mr-3"
                >
                  ⚙️
                </motion.div>
                Validation Guidelines
              </h3>
              <div className="text-blue-100 space-y-4">
                <motion.div 
                  className="flex items-start space-x-3"
                  whileHover={{ x: 5 }}
                >
                  <span className="text-green-400 font-bold">1.</span>
                  <p>Login ID should be unique and between 6-12 characters</p>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-3"
                  whileHover={{ x: 5 }}
                >
                  <span className="text-green-400 font-bold">2.</span>
                  <p>Email ID should not be duplicate in database</p>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-3"
                  whileHover={{ x: 5 }}
                >
                  <span className="text-green-400 font-bold">3.</span>
                  <p>Password must contain uppercase, lowercase, special character and be 8+ characters</p>
                </motion.div>
                <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/20">
                  <p className="text-blue-300 font-medium text-center">✨ Real-time validation active</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* User Rights */}
          <motion.div 
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl relative overflow-hidden"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl" />
            <div className="relative z-10">
              <h3 className="text-white font-bold mb-6 flex items-center text-xl">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mr-3"
                >
                  👑
                </motion.div>
                User Rights
              </h3>
              <div className="text-blue-100 space-y-4">
                {selectedRole ? (
                  <motion.div 
                    className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <div className="flex items-center mb-4">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <selectedRole.icon className="w-6 h-6 mr-3 text-blue-400" />
                      </motion.div>
                      <span className="text-white font-bold text-lg">{selectedRole.name}</span>
                    </div>
                    <p className="text-green-300 font-medium">{selectedRole.description}</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <motion.div 
                      className="p-4 bg-white/5 rounded-xl border border-white/10"
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                      <p><strong className="text-blue-400">👨‍💼 Accountant</strong> - Can create invoices but cannot modify master data</p>
                    </motion.div>
                    <motion.div 
                      className="p-4 bg-white/5 rounded-xl border border-white/10"
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                      <p><strong className="text-red-400">🔐 Admin</strong> - Full access rights to all system features</p>
                    </motion.div>
                    <motion.div 
                      className="p-4 bg-white/5 rounded-xl border border-white/10"
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                      <p><strong className="text-purple-400">👤 Client</strong> - Limited user rights for client portal</p>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreateUser;
