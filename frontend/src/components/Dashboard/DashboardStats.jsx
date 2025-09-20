import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DashboardStats = ({ totalInvoice, totalPurchase, totalPayment }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value) => {
    return value >= 0 ? 'var(--success)' : 'var(--error)';
  };

  const getChangeIcon = (value) => {
    return value >= 0 ? ArrowUpRight : ArrowDownRight;
  };

  const sections = [
    {
      title: 'TOTAL INVOICE',
      data: totalInvoice,
      icon: TrendingUp,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'TOTAL PURCHASE',
      data: totalPurchase,
      icon: TrendingDown,
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      title: 'TOTAL PAYMENT',
      data: totalPayment,
      icon: CreditCard,
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="shiv-surface rounded-xl p-8 mb-8 hover:shadow-lg transition-all duration-300"
      style={{
        border: `1px solid var(--border)`,
        boxShadow: '0 4px 12px var(--shadow)'
      }}
    >
      <div className="space-y-8">
        {sections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="border-b last:border-b-0 pb-8 last:pb-0 cursor-pointer"
              style={{ borderColor: 'var(--border-light)' }}
              onMouseEnter={() => setHoveredCard(sectionIndex)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={{ scale: 1.02 }}
            >
              {/* Section Header */}
              <div className="flex items-center mb-6">
                <motion.div 
                  className="p-3 rounded-lg mr-4 relative overflow-hidden"
                  style={{ backgroundColor: 'var(--border-light)' }}
                  animate={{
                    scale: hoveredCard === sectionIndex ? 1.1 : 1,
                    rotate: hoveredCard === sectionIndex ? 5 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                  {hoveredCard === sectionIndex && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r opacity-20"
                      style={{ background: `linear-gradient(45deg, var(--primary), var(--primary-light))` }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                    />
                  )}
                </motion.div>
                <h3 className="text-xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
                  {section.title}
                </h3>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Last 24 Hours */}
                <motion.div 
                  className="text-center p-4 rounded-lg transition-all duration-300"
                  style={{ backgroundColor: hoveredCard === sectionIndex ? 'var(--border-light)' : 'transparent' }}
                  whileHover={{ y: -2 }}
                >
                  <motion.p 
                    className="text-3xl font-bold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                    animate={{ scale: hoveredCard === sectionIndex ? 1.05 : 1 }}
                  >
                    {formatCurrency(section.data.last24Hours)}
                  </motion.p>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                    Last 24 hours
                  </p>
                  {section.data.change24h !== 0 && (
                    <motion.span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getChangeColor(section.data.change24h) + '20',
                        color: getChangeColor(section.data.change24h)
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {React.createElement(getChangeIcon(section.data.change24h), { className: 'w-3 h-3 mr-1' })}
                      {formatPercentage(section.data.change24h)}
                    </motion.span>
                  )}
                </motion.div>

                {/* Last 7 Days */}
                <motion.div 
                  className="text-center p-4 rounded-lg transition-all duration-300"
                  style={{ backgroundColor: hoveredCard === sectionIndex ? 'var(--border-light)' : 'transparent' }}
                  whileHover={{ y: -2 }}
                >
                  <motion.p 
                    className="text-3xl font-bold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                    animate={{ scale: hoveredCard === sectionIndex ? 1.05 : 1 }}
                  >
                    {formatCurrency(section.data.last7Days)}
                  </motion.p>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                    Last 7 Days
                  </p>
                  {section.data.change7d !== 0 && (
                    <motion.span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getChangeColor(section.data.change7d) + '20',
                        color: getChangeColor(section.data.change7d)
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {React.createElement(getChangeIcon(section.data.change7d), { className: 'w-3 h-3 mr-1' })}
                      {formatPercentage(section.data.change7d)}
                    </motion.span>
                  )}
                </motion.div>

                {/* Last 30 Days */}
                <motion.div 
                  className="text-center p-4 rounded-lg transition-all duration-300"
                  style={{ backgroundColor: hoveredCard === sectionIndex ? 'var(--border-light)' : 'transparent' }}
                  whileHover={{ y: -2 }}
                >
                  <motion.p 
                    className="text-3xl font-bold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                    animate={{ scale: hoveredCard === sectionIndex ? 1.05 : 1 }}
                  >
                    {formatCurrency(section.data.last30Days)}
                  </motion.p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Last 30 Days
                  </p>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DashboardStats;
