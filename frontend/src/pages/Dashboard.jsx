import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth'; 
import DashboardStats from '../components/Dashboard/DashboardStats';
import SalesChart from '../components/Dashboard/SalesChart';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import { mockDashboardStats, mockSalesData, mockTransactions, mockTimeBasedStats } from '../data/mockdata';

const Dashboard = () => {
  const { user } = useAuth();

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

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getDashboardTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.name}! Here's what's happening with your business.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} className="text-right mt-4 md:mt-0">
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {user?.role === 'admin' || user?.role === 'accountant' ? (
          <>
            <ActionButton
              title="Create Invoice"
              subtitle="Generate a new sales invoice"
              gradient="from-blue-500 to-blue-600"
            />
            <ActionButton
              title="Record Payment"
              subtitle="Log a new payment received"
              gradient="from-green-500 to-green-600"
            />
            <ActionButton
              title="Add Contact"
              subtitle="Add a new customer or vendor"
              gradient="from-purple-500 to-purple-600"
            />
            <ActionButton
              title="View Reports"
              subtitle="Access financial reports"
              gradient="from-orange-500 to-orange-600"
            />
          </>
        ) : (
          <>
            <ActionButton
              title="View Invoices"
              subtitle="Check your pending invoices"
              gradient="from-blue-500 to-blue-600"
            />
            <ActionButton
              title="Make Payment"
              subtitle="Pay your outstanding bills"
              gradient="from-green-500 to-green-600"
            />
            <ActionButton
              title="Transaction History"
              subtitle="View all your transactions"
              gradient="from-purple-500 to-purple-600"
            />
            <ActionButton
              title="Download Reports"
              subtitle="Get your financial statements"
              gradient="from-orange-500 to-orange-600"
            />
          </>
        )}
      </motion.div>
    </div>
  );
};

// Reusable Action Button Component
const ActionButton = ({ title, subtitle, gradient }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`p-6 bg-gradient-to-r ${gradient} text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow`}
  >
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-white/80 text-sm">{subtitle}</p>
  </motion.button>
);

export default Dashboard;
