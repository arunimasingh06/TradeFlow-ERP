import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Check, Printer, Send, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const PaymentPage = ({ onBack, onHome, paymentData }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    paymentRef: '',
    paymentType: 'Send',
    partnerType: 'Vendor',
    partner: paymentData?.partner || '',
    amount: paymentData?.amount || 0,
    date: '',
    paymentVia: '',
    note: ''
  });

  const [status, setStatus] = useState('Draft');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = () => {
    setStatus('Confirmed');
    console.log('Payment confirmed');
  };

  const handlePrint = () => {
    console.log('Printing Payment');
  };

  const handleSend = () => {
    console.log('Sending Payment');
  };

  const handleCancel = () => {
    setStatus('Cancelled');
    console.log('Payment cancelled');
  };

  const getActionButtons = () => {
    if (user?.role === 'admin' || user?.role === 'accountant') {
      return [
        { id: 'confirm', label: 'Confirm', icon: Check, action: handleConfirm },
        { id: 'print', label: 'Print', icon: Printer, action: handlePrint },
        { id: 'send', label: 'Send', icon: Send, action: handleSend },
        { id: 'cancel', label: 'Cancel', icon: X, action: handleCancel }
      ];
    }
    return [];
  };

  const getStatusButtons = () => {
    if (user?.role === 'admin' || user?.role === 'accountant') {
      return [
        { id: 'draft', label: 'Draft', icon: Check, action: () => setStatus('Draft') },
        { id: 'cancelled', label: 'Cancelled', icon: X, action: () => setStatus('Cancelled') }
      ];
    }
    return [];
  };

  const getNavigationButtons = () => {
    return [
      { id: 'back', label: 'Back', icon: ArrowLeft, action: onBack },
      { id: 'home', label: 'Home', icon: Home, action: onHome }
    ];
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shiv-surface shiv-shadow border-b"
        style={{borderColor: 'var(--border)'}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
              Bill Payment
            </h1>
            
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              {getNavigationButtons().map((button, index) => {
                const ButtonIcon = button.icon;
                return (
                  <motion.button
                    key={button.id}
                    onClick={button.action}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--border-light)',
                      color: 'var(--text-primary)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--border)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--border-light)'}
                  >
                    {ButtonIcon && <ButtonIcon className="w-4 h-4 mr-2" />}
                    {button.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shiv-surface rounded-xl overflow-hidden"
          style={{
            border: `2px solid var(--border)`,
            boxShadow: '0 8px 24px var(--shadow)',
            backgroundColor: 'var(--surface)'
          }}
        >
          {/* Action Buttons */}
          <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getActionButtons().map((button, index) => {
                  const ButtonIcon = button.icon;
                  return (
                    <motion.button
                      key={button.id}
                      onClick={button.action}
                      className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 border-2"
                      style={{
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--primary)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--primary)';
                        e.target.style.color = 'white';
                        e.target.style.borderColor = 'var(--primary)';
                        e.target.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'var(--surface)';
                        e.target.style.color = 'var(--text-primary)';
                        e.target.style.borderColor = 'var(--primary)';
                        e.target.style.opacity = '1';
                      }}
                    >
                      {ButtonIcon && <ButtonIcon className="w-4 h-4 mr-2" />}
                      {button.label}
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Status Buttons - Right Corner */}
              <div className="flex items-center space-x-3">
                {getStatusButtons().map((button, index) => {
                  const ButtonIcon = button.icon;
                  return (
                    <motion.button
                      key={button.id}
                      onClick={button.action}
                      className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 border-2"
                      style={{
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--primary)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--primary)';
                        e.target.style.color = 'white';
                        e.target.style.borderColor = 'var(--primary)';
                        e.target.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'var(--surface)';
                        e.target.style.color = 'var(--text-primary)';
                        e.target.style.borderColor = 'var(--primary)';
                        e.target.style.opacity = '1';
                      }}
                    >
                      {ButtonIcon && <ButtonIcon className="w-4 h-4 mr-2" />}
                      {button.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Payment Type */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{color: 'var(--text-primary)'}}>
                    Payment Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentType"
                        value="Send"
                        checked={formData.paymentType === 'Send'}
                        onChange={(e) => handleInputChange('paymentType', e.target.value)}
                        className="mr-2"
                        style={{accentColor: 'var(--primary)'}}
                      />
                      <span style={{color: 'var(--text-primary)'}}>Send</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentType"
                        value="Receive"
                        checked={formData.paymentType === 'Receive'}
                        onChange={(e) => handleInputChange('paymentType', e.target.value)}
                        className="mr-2"
                        style={{accentColor: 'var(--primary)'}}
                      />
                      <span style={{color: 'var(--text-primary)'}}>Receive</span>
                    </label>
                  </div>
                </div>

                {/* Partner Type */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{color: 'var(--text-primary)'}}>
                    Partner Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="partnerType"
                        value="Customer"
                        checked={formData.partnerType === 'Customer'}
                        onChange={(e) => handleInputChange('partnerType', e.target.value)}
                        className="mr-2"
                        style={{accentColor: 'var(--primary)'}}
                      />
                      <span style={{color: 'var(--text-primary)'}}>Customer</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="partnerType"
                        value="Vendor"
                        checked={formData.partnerType === 'Vendor'}
                        onChange={(e) => handleInputChange('partnerType', e.target.value)}
                        className="mr-2"
                        style={{accentColor: 'var(--primary)'}}
                      />
                      <span style={{color: 'var(--text-primary)'}}>Vendor</span>
                    </label>
                  </div>
                </div>

                {/* Partner */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Partner
                  </label>
                  <input
                    type="text"
                    value={formData.partner}
                    onChange={(e) => handleInputChange('partner', e.target.value)}
                    placeholder="Enter partner name"
                    className="w-full px-3 py-2 rounded-lg border bg-transparent"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                    (auto fill partner name from Invoice/Bill)
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 rounded-lg border bg-transparent"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                    (auto fill amount due from Invoice/Bill)
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-transparent"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                    (Default Today Date)
                  </p>
                </div>

                {/* Payment Via */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Payment Via
                  </label>
                  <input
                    type="text"
                    value={formData.paymentVia}
                    onChange={(e) => handleInputChange('paymentVia', e.target.value)}
                    placeholder="Select payment method (Bank/Cash)"
                    className="w-full px-3 py-2 rounded-lg border bg-transparent"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                    (Default Bank can be selectable to Cash)
                  </p>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Note
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    placeholder="Enter payment notes"
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border bg-transparent resize-none"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                    Alpha numeric ( text )
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
