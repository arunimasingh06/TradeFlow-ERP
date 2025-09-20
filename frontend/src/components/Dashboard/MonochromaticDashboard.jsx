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
  Building2,
  ShoppingCart,
  FileText,
  Menu,
  X,
  ChevronRight
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
import PurchaseOrderMaster from '../orders/PurchaseOrderMaster';
import SalesOrderMaster from '../orders/SalesOrderMaster';
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
  const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);
  const [showSalesOrder, setShowSalesOrder] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  // If showing purchase order page
  if (showPurchaseOrder) {
    try {
      return <PurchaseOrderMaster
        onBack={() => setShowPurchaseOrder(false)}
        onHome={() => setShowPurchaseOrder(false)}
      />;
    } catch (error) {
      console.error('Error rendering PurchaseOrderMaster:', error);
      return <div>Error loading Purchase Order</div>;
    }
  }

  // If showing sales order page
  if (showSalesOrder) {
    try {
      return (
        <SalesOrderMaster
          onBack={() => setShowSalesOrder(false)}
          onHome={() => {
            setShowSalesOrder(false);
            // Reset all other states to go back to main dashboard
            setShowCreateUser(false);
            setShowContactMaster(false);
            setShowProductMaster(false);
            setShowTaxesMaster(false);
            setShowChartOfAccounts(false);
            setShowVendorMaster(false);
            setShowPurchaseOrder(false);
          }}
        />
      );
    } catch (error) {
      console.error('Error rendering SalesOrder:', error);
      return <div>Error loading Sales Order</div>;
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

  const getSidebarItems = () => {
    if (user?.role === 'admin' || user?.role === 'accountant') {
      return [
        { id: 'purchase-order', label: 'Purchase Order', icon: ShoppingCart, color: 'var(--primary)', description: 'Manage purchase orders' },
        { id: 'sales-order', label: 'Sales Order', icon: FileText, color: 'var(--secondary)', description: 'Manage sales orders' }
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
          <div className="relative w-full">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center">
              {/* Sidebar Toggle Button */}
              {(user?.role === 'admin' || user?.role === 'accountant') && (
                <motion.button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-4 p-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: sidebarOpen ? 'var(--primary)' : 'var(--border-light)',
                    color: sidebarOpen ? 'white' : 'var(--text-primary)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.button>
              )}
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Shiv Furnitures
                </h1>
              </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 group-hover:text-gray-800 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                <button className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 relative group">
                  <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-medium text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="font-medium text-gray-700 text-sm max-w-20 truncate">{user?.name?.split(' ')[0] || 'User'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className="inline-block mt-2 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                          {user?.role}
                        </span>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            // Add settings functionality here
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-3 text-gray-500" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Header Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="px-6 py-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <motion.div 
                className="flex items-center space-x-4 mb-3"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BarChart3 className="w-6 h-6 text-white" />
                </motion.div>
                <motion.h1 
                  className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {getDashboardTitle()}
                </motion.h1>
              </motion.div>
              
              <motion.p 
                className="text-lg font-semibold text-gray-700 leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.01,
                  color: '#3B82F6',
                  transition: { duration: 0.3 }
                }}
              >
                Welcome back, <span className="text-blue-600 font-bold text-xl">{user?.name || 'User'}</span>! 
                <motion.span 
                  className="block mt-1 text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Here's what's happening with your furniture business.
                </motion.span>
              </motion.p>
            </div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center mb-3 mx-auto"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar className="w-8 h-8 text-blue-600" />
              </motion.div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-800">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Date().getDate()}
                </p>
                <p className="text-sm font-semibold text-gray-600">
                  {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="w-full py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 px-6">
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
            className="shiv-surface rounded-xl p-6 mb-6 mx-6"
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


        {/* Dashboard Stats */}
        <div className="mx-6 mb-6">
          <DashboardStats
            totalInvoice={mockTimeBasedStats.totalInvoice}
            totalPurchase={mockTimeBasedStats.totalPurchase}
            totalPayment={mockTimeBasedStats.totalPayment}
          />
        </div>

        {/* Charts */}
        {(user?.role === 'admin' || user?.role === 'accountant') && (
          <div className="mx-6 mb-6">
            <SalesChart data={mockSalesData} />
          </div>
        )}

        {/* Recent Transactions */}
        <div className="mx-6">
          <RecentTransactions transactions={mockTransactions} />
        </div>
      </div>

      {/* Interactive Sidebar */}
      {(user?.role === 'admin' || user?.role === 'accountant') && (
        <>
          {/* Sidebar Overlay */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: sidebarOpen ? 0 : -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-80 z-50 shadow-2xl"
            style={{
              backgroundColor: 'var(--surface)',
              borderRight: `2px solid var(--border)`
            }}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Order Management
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Manage your orders efficiently
                  </p>
                </div>
                <motion.button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--border-light)',
                    color: 'var(--text-primary)'
                  }}
                  whileHover={{ scale: 1.1, backgroundColor: 'var(--error)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="p-6 space-y-4">
              {getSidebarItems().map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full p-4 rounded-xl transition-all duration-300 group relative overflow-hidden"
                    style={{
                      backgroundColor: activeSidebarItem === item.id ? 'var(--border-light)' : 'transparent',
                      border: activeSidebarItem === item.id ? `2px solid ${item.color}` : 'none',
                      boxShadow: activeSidebarItem === item.id ? `0 8px 24px ${item.color}20` : '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      y: -2,
                      border: `2px solid ${item.color}`,
                      boxShadow: `0 12px 32px ${item.color}30`
                    }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setActiveSidebarItem(item.id)}
                    onMouseLeave={() => setActiveSidebarItem(null)}
                    onClick={() => {
                      if (item.id === 'purchase-order') setShowPurchaseOrder(true);
                      if (item.id === 'sales-order') setShowSalesOrder(true);
                      setSidebarOpen(false);
                    }}
                  >
                    {/* Background Gradient Effect */}
                    <motion.div
                      className="absolute inset-0 opacity-10"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}, transparent)`
                      }}
                      initial={{ scale: 0, rotate: 0 }}
                      whileHover={{ scale: 1, rotate: 180 }}
                      transition={{ duration: 0.6 }}
                    />

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className="p-3 rounded-xl"
                          style={{
                            backgroundColor: item.color + '20',
                            border: `2px solid ${item.color}30`
                          }}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <ItemIcon className="w-6 h-6" style={{ color: item.color }} />
                        </motion.div>
                        <div className="text-left">
                          <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                            {item.label}
                          </h3>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                      </motion.div>
                    </div>

                    {/* Hover Effect Line */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Quick access to order management
                </p>
                <motion.div
                  className="mt-2 h-1 rounded-full mx-auto"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    width: '60px'
                  }}
                  animate={{ 
                    scaleX: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default MonochromaticDashboard;
