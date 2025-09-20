import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign,
  RefreshCw,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import DashboardStats from './Dashboard/DashboardStats';
import SalesChart from './Dashboard/SalesChart';
import RecentTransactions from './Dashboard/RecentTransactions';
import ClientPortal from './Dashboard/ClientPortal';
import CreateUser from './admin/CreateUser';
import {
  mockSalesData,
  mockTransactions,
  mockTimeBasedStats,
  mockUser
} from '../data/mockdata';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [showCreateUser, setShowCreateUser] = useState(false);

  // If user is a client, show the client portal instead
  if (user?.role === 'contact') {
    return <ClientPortal user={user} />;
  }

  // If showing create user page
  if (showCreateUser) {
    return <CreateUser onBack={() => setShowCreateUser(false)} />;
  }

  // Remove auto-login since we want login page first

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Administrator Dashboard';
      case 'accountant':
        return 'Accountant Dashboard';
      case 'contact':
        return 'Client Portal';
      default:
        return 'Dashboard';
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const quickStats = [
    {
      title: 'Total Revenue',
      value: '₹12,45,000',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Clients',
      value: '248',
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Growth Rate',
      value: '18.5%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shiv-surface shiv-shadow border-b shiv-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold shiv-text-primary">
                Shiv Furnitures
              </h1>
              <div className="ml-4 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="text-sm border-0 bg-transparent shiv-text-secondary focus:ring-0"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center px-3 py-2 text-sm font-medium shiv-text-primary rounded-lg transition-colors disabled:opacity-50"
                style={{backgroundColor: 'var(--border-light)'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--border)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--border-light)'}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* Admin-only Create User button */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{backgroundColor: 'var(--primary-light)'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-light)'}
                  title="Create New User"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </button>
              )}
              
              <button className="relative p-2 shiv-text-muted transition-colors" onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="p-2 shiv-text-muted transition-colors" onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}">
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{backgroundColor: 'var(--error)'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--error)'}
                title="Logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {getDashboardTitle()}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {user?.name || 'User'}! Here's what's happening with your business.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Date</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </motion.div>
        </motion.div>

        {/* Dashboard Stats */}
        <DashboardStats
          totalInvoice={mockTimeBasedStats.totalInvoice}
          totalPurchase={mockTimeBasedStats.totalPurchase}
          totalPayment={mockTimeBasedStats.totalPayment}
        />

        {/* Charts */}
        {(user?.role === 'admin' || user?.role === 'accountant') && (
          <SalesChart data={mockSalesData} />
        )}

        {/* Recent Transactions */}
        <RecentTransactions transactions={mockTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;
