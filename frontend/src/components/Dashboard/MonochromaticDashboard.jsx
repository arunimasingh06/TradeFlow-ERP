import React, { useState } from 'react';
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
  UserPlus,
  CreditCard,
  List,
  Contact,
  Package,
  Calculator,
  BarChart3,
  Building2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import DashboardStats from './DashboardStats';
import SalesChart from './SalesChart';
import RecentTransactions from './RecentTransactions';
import ClientPortal from './ClientPortal';
import CreateUser from '../admin/CreateUser';
import ContactMaster from '../contacts/ContactMaster';
import ProductMaster from '../products/ProductMaster';
import TaxesMaster from '../taxes/TaxesMaster';
import ChartOfAccounts from '../accounts/ChartOfAccounts';
import VendorMaster from '../vendors/VendorMaster';
import {
  mockSalesData,
  mockTransactions,
  mockTimeBasedStats,
  mockUser
} from '../../data/mockdata';

const MonochromaticDashboard = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showContactMaster, setShowContactMaster] = useState(false);
  const [showProductMaster, setShowProductMaster] = useState(false);
  const [showTaxesMaster, setShowTaxesMaster] = useState(false);
  const [showChartOfAccounts, setShowChartOfAccounts] = useState(false);
  const [showVendorMaster, setShowVendorMaster] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  // Debug logging
  console.log('MonochromaticDashboard rendering for user:', user);

  // Add fallback for missing user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading user data...</div>
      </div>
    );
  }

  // If user is a client, show the client portal instead
  if (user?.role === 'contact') {
    try {
      return <ClientPortal user={user} />;
    } catch (error) {
      console.error('ClientPortal error:', error);
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading Client Portal...</div>
        </div>
      );
    }
  }

  // If showing create user page
  if (showCreateUser) {
    try {
      return <CreateUser onBack={() => setShowCreateUser(false)} />;
    } catch (error) {
      console.error('CreateUser error:', error);
      setShowCreateUser(false);
    }
  }

  // If showing contact master page
  if (showContactMaster) {
    try {
      return <ContactMaster
        onBack={() => setShowContactMaster(false)}
        onHome={() => setShowContactMaster(false)}
      />;
    } catch (error) {
      console.error('ContactMaster error:', error);
      setShowContactMaster(false);
    }
  }

  // If showing product master page
  if (showProductMaster) {
    try {
      return <ProductMaster
        onBack={() => setShowProductMaster(false)}
        onHome={() => setShowProductMaster(false)}
      />;
    } catch (error) {
      console.error('ProductMaster error:', error);
      setShowProductMaster(false);
    }
  }

  // If showing taxes master page
  if (showTaxesMaster) {
    try {
      return <TaxesMaster
        onBack={() => setShowTaxesMaster(false)}
        onHome={() => setShowTaxesMaster(false)}
      />;
    } catch (error) {
      console.error('TaxesMaster error:', error);
      setShowTaxesMaster(false);
    }
  }

  // If showing chart of accounts page
  if (showChartOfAccounts) {
    try {
      return <ChartOfAccounts
        onBack={() => setShowChartOfAccounts(false)}
        onHome={() => setShowChartOfAccounts(false)}
      />;
    } catch (error) {
      console.error('Error rendering ChartOfAccounts:', error);
      return <div>Error loading Chart of Accounts</div>;
    }
  }

  // If showing vendor master page
  if (showVendorMaster) {
    try {
      return <VendorMaster
        onBack={() => setShowVendorMaster(false)}
        onHome={() => setShowVendorMaster(false)}
      />;
    } catch (error) {
      console.error('Error rendering VendorMaster:', error);
      return <div>Error loading Vendor Master</div>;
    }
  }

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
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Active Clients',
      value: '248',
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Growth Rate',
      value: '18.5%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  const getQuickActions = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { id: 'contact-master', label: 'Customer', icon: Contact, color: 'var(--success)' },
          { id: 'vendor-master', label: 'Vendors', icon: Building2, color: 'var(--purple)' },
          { id: 'product-master', label: 'Products', icon: Package, color: 'var(--info)' },
          { id: 'taxes-master', label: 'Taxes', icon: Calculator, color: 'var(--warning)' },
          { id: 'chart-accounts', label: 'Chart of Accountants', icon: BarChart3, color: 'var(--error)' }
        ];
      case 'accountant':
        return [
          { id: 'contact-master', label: 'Customer', icon: Contact, color: 'var(--success)' },
          { id: 'vendor-master', label: 'Vendors', icon: Building2, color: 'var(--purple)' },
          { id: 'product-master', label: 'Products', icon: Package, color: 'var(--info)' },
          { id: 'taxes-master', label: 'Taxes', icon: Calculator, color: 'var(--warning)' },
          { id: 'chart-accounts', label: 'Chart of Accountants', icon: BarChart3, color: 'var(--error)' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shiv-surface shiv-shadow border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Shiv Furnitures
              </h1>
              <div className="ml-4 flex items-center space-x-2">
                <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="text-sm border-0 bg-transparent focus:ring-0"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
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
                  style={{ backgroundColor: 'var(--primary-light)' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-light)'}
                  title="Create New User"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </button>
              )}

              <motion.button
                className="relative p-2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                <motion.span
                  className="absolute top-0 right-0 w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--error)' }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                ></motion.span>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 rounded-lg shadow-lg z-50"
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: `1px solid var(--border)`,
                      boxShadow: '0 8px 24px var(--shadow)'
                    }}
                  >
                    <div className="p-4">
                      <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Notifications</h4>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--border-light)' }}>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>New invoice created</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>2 minutes ago</p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--border-light)' }}>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Payment received</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.button>

              <motion.button
                className="p-2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                <Settings className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--error)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--error)'}
                title="Logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </motion.button>
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
                className="shiv-surface rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                style={{
                  border: `1px solid var(--border)`,
                  boxShadow: '0 4px 12px var(--shadow)',
                  backgroundColor: 'var(--surface)'
                }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {stat.title}
                    </p>
                    <motion.p
                      className="text-3xl font-bold mb-3"
                      style={{ color: 'var(--text-primary)' }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      {stat.value}
                    </motion.p>
                    <div className="flex items-center">
                      <motion.span
                        className="text-sm font-medium px-2 py-1 rounded-full"
                        style={{
                          color: 'var(--success)',
                          backgroundColor: 'var(--success)' + '20'
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {stat.change}
                      </motion.span>
                      <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                        vs last month
                      </span>
                    </div>
                  </div>
                  <motion.div
                    className="p-4 rounded-xl relative overflow-hidden"
                    style={{ backgroundColor: 'var(--border-light)' }}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="w-8 h-8 relative z-10" style={{ color: 'var(--primary)' }} />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br opacity-20"
                      style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-light))` }}
                      initial={{ scale: 0, rotate: 0 }}
                      whileHover={{ scale: 1, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions for Admin/Accountant */}
        {(user?.role === 'admin' || user?.role === 'accountant') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="shiv-surface rounded-xl p-6 mb-8"
            style={{
              border: `1px solid var(--border)`,
              boxShadow: '0 4px 12px var(--shadow)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {getQuickActions().map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 group"
                    style={{
                      border: `1px solid var(--border)`,
                      backgroundColor: activeQuickAction === action.id ? 'var(--border-light)' : 'transparent'
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setActiveQuickAction(action.id)}
                    onMouseLeave={() => setActiveQuickAction(null)}
                    onClick={() => {
                      if (action.id === 'create-user') setShowCreateUser(true);
                      if (action.id === 'contact-master') setShowContactMaster(true);
                      if (action.id === 'vendor-master') setShowVendorMaster(true);
                      if (action.id === 'product-master') setShowProductMaster(true);
                      if (action.id === 'taxes-master') setShowTaxesMaster(true);
                      if (action.id === 'chart-accounts') setShowChartOfAccounts(true);
                    }}
                  >
                    <motion.div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: action.color + '20' }}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <ActionIcon className="w-5 h-5" style={{ color: action.color }} />
                    </motion.div>
                    <span className="font-medium group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {getDashboardTitle()}
            </h1>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
              Welcome back, {user?.name || 'User'}! Here's what's happening with your furniture business.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} className="text-right">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Current Date</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
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

export default MonochromaticDashboard;
