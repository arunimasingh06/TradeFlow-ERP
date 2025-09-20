import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

const SalesChart = ({ data }) => {
  const [activeChart, setActiveChart] = useState('line');
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Sales vs Purchases Line Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="shiv-surface rounded-xl p-6 hover:shadow-lg transition-all duration-300"
        style={{
          border: `1px solid var(--border)`,
          boxShadow: '0 4px 12px var(--shadow)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Sales vs Purchases Trend
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveChart('line')}
              className={`p-2 rounded-lg transition-colors ${
                activeChart === 'line' ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: activeChart === 'line' ? 'var(--primary)' : 'var(--border-light)',
                color: activeChart === 'line' ? 'white' : 'var(--text-muted)'
              }}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveChart('bar')}
              className={`p-2 rounded-lg transition-colors ${
                activeChart === 'bar' ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: activeChart === 'bar' ? 'var(--primary)' : 'var(--border-light)',
                color: activeChart === 'bar' ? 'white' : 'var(--text-muted)'
              }}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px var(--shadow)',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value) => [formatCurrency(value), '']}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--success)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--success)', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: 'var(--success)', strokeWidth: 2 }}
                  name="Sales"
                />
                <Line
                  type="monotone"
                  dataKey="purchases"
                  stroke="var(--error)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--error)', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: 'var(--error)', strokeWidth: 2 }}
                  name="Purchases"
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px var(--shadow)',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value) => [formatCurrency(value), '']}
                />
                <Bar
                  dataKey="sales"
                  fill="var(--success)"
                  radius={[4, 4, 0, 0]}
                  name="Sales"
                />
                <Bar
                  dataKey="purchases"
                  fill="var(--error)"
                  radius={[4, 4, 0, 0]}
                  name="Purchases"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Monthly Revenue Comparison */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="shiv-surface rounded-xl p-6 hover:shadow-lg transition-all duration-300"
        style={{
          border: `1px solid var(--border)`,
          boxShadow: '0 4px 12px var(--shadow)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Monthly Revenue Comparison
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--success)' }}></div>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sales</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--error)' }}></div>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Purchases</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: `1px solid var(--border)`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px var(--shadow)',
                  color: 'var(--text-primary)'
                }}
                formatter={(value) => [formatCurrency(value), '']}
              />
              <Bar
                dataKey="sales"
                fill="var(--success)"
                radius={[4, 4, 0, 0]}
                name="Sales"
              />
              <Bar
                dataKey="purchases"
                fill="var(--error)"
                radius={[4, 4, 0, 0]}
                name="Purchases"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default SalesChart;
