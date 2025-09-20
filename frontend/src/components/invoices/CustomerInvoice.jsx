import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Check, Printer, Send, X, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import InvoicePayment from '../payments/InvoicePayment';

const CustomerInvoice = ({ onBack, onHome, salesOrder, products }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customerInvoiceNo: salesOrder?.customerName ? 'INV/2025/0001' : '',
    customerName: salesOrder?.customerName || '',
    reference: salesOrder?.reference || '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Transform products from sales order or use empty structure for new invoices
  const [invoiceProducts] = useState(
    products && products.length > 0 && products.some(p => p.product) ? 
    products.map(p => ({
      id: p.id,
      product: p.product,
      hsnNo: 'Auto Fill From Product (related field)',
      accountName: 'Sales Income A/c',
      qty: p.qty,
      unitPrice: p.unitPrice,
      untaxedAmount: p.untaxedAmount,
      tax: p.tax,
      taxAmount: p.taxAmount,
      total: p.total
    })) : [
      {
        id: 1,
        product: '',
        hsnNo: '',
        accountName: 'Sales Income A/c',
        qty: 0,
        unitPrice: 0,
        untaxedAmount: 0,
        tax: '5%',
        taxAmount: 0,
        total: 0
      }
    ]
  );

  const [status, setStatus] = useState('Draft');
  const [showInvoicePayment, setShowInvoicePayment] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = () => {
    setStatus('Confirmed');
    console.log('Customer Invoice confirmed');
  };

  const handlePrint = () => {
    console.log('Printing Customer Invoice');
  };

  const handleSend = () => {
    console.log('Sending Customer Invoice');
  };

  const handleCancel = () => {
    setStatus('Cancelled');
    console.log('Customer Invoice cancelled');
  };

  const handlePay = () => {
    console.log('Processing Payment for Customer Invoice');
    // Navigate to InvoicePayment with invoice data
    setShowInvoicePayment(true);
  };

  const getActionButtons = () => {
    if (user?.role === 'admin' || user?.role === 'accountant') {
      return [
        { id: 'confirm', label: 'Confirm', icon: Check, action: handleConfirm },
        { id: 'print', label: 'Print', icon: Printer, action: handlePrint },
        { id: 'send', label: 'Send', icon: Send, action: handleSend },
        { id: 'cancel', label: 'Cancel', icon: X, action: handleCancel },
        { id: 'pay', label: 'Pay', icon: CreditCard, action: handlePay }
      ];
    }
    return [];
  };

  const getStatusButtons = () => {
    if (user?.role === 'admin' || user?.role === 'accountant') {
      return [
        { id: 'draft', label: 'Draft', icon: Check, action: () => setStatus('Draft') },
        { id: 'confirmed', label: 'Confirm', icon: Check, action: () => setStatus('Confirmed') },
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

  const calculateTotals = () => {
    const numericProducts = invoiceProducts.filter(p => typeof p.untaxedAmount === 'number');
    const subtotal = numericProducts.reduce((sum, product) => sum + product.untaxedAmount, 0);
    const totalTax = numericProducts.reduce((sum, product) => sum + product.taxAmount, 0);
    const grandTotal = subtotal + totalTax;
    
    return { subtotal, totalTax, grandTotal };
  };

  const { subtotal, totalTax, grandTotal } = calculateTotals();
  const paidViaCash = 0;
  const paidViaBank = grandTotal;
  const amountDue = 0;

  // If showing invoice payment, render InvoicePayment component
  if (showInvoicePayment) {
    return (
      <InvoicePayment
        onBack={() => setShowInvoicePayment(false)}
        onHome={onHome}
        invoiceData={{
          customerName: formData.customerName,
          amount: grandTotal
        }}
      />
    );
  }

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
              New
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
          {/* Form Header */}
          <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer Invoice No */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Customer Invoice No.
                </label>
                <input
                  type="text"
                  value={formData.customerInvoiceNo}
                  onChange={(e) => handleInputChange('customerInvoiceNo', e.target.value)}
                  placeholder="Enter invoice number (e.g., INV/2025/0001)"
                  className="w-full px-3 py-2 rounded-lg border bg-transparent"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)'
                  }}
                />
                <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                  (auto generate Invoice Number if not last Invoice No.)
                </p>
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-transparent"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)'
                  }}
                />
                <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                  Date
                </p>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-transparent"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)'
                  }}
                />
                <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                  Date
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Customer Name
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Select or enter customer name"
                  className="w-full px-3 py-2 rounded-lg border bg-transparent"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)'
                  }}
                />
                <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                  (From Contact Master - Away to one)
                </p>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Reference
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                  placeholder="Enter reference number"
                  className="w-full px-3 py-2 rounded-lg border bg-transparent"
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

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-between">
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

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{borderColor: 'var(--border)', backgroundColor: 'var(--border-light)'}}>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Sr. No.</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>HSN No.</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Account Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Unit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Untaxed Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Tax</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Tax Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceProducts.map((product, index) => (
                  <tr key={product.id} className="border-b" style={{borderColor: 'var(--border)'}}>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>{index + 1}</td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>{product.product}</td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>{product.hsnNo}</td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>{product.accountName}</td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>{product.qty}</td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>
                      {typeof product.unitPrice === 'number' ? `₹${product.unitPrice}` : product.unitPrice}
                    </td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>
                      {typeof product.untaxedAmount === 'number' ? `₹${product.untaxedAmount}` : product.untaxedAmount}
                    </td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>{product.tax}</td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>
                      {typeof product.taxAmount === 'number' ? `₹${product.taxAmount}` : product.taxAmount}
                    </td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>
                      {typeof product.total === 'number' ? `₹${product.total}` : product.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="p-6 border-t" style={{borderColor: 'var(--border)'}}>
            <div className="flex justify-end">
              <div className="w-96 space-y-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span style={{color: 'var(--text-primary)'}}>Total:</span>
                  <span style={{color: 'var(--text-primary)'}}>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-3" style={{borderColor: 'var(--border)'}}>
                  <div className="flex justify-between">
                    <span style={{color: 'var(--text-primary)'}}>Paid via Cash:</span>
                    <span style={{color: 'var(--text-primary)'}}>₹{paidViaCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{color: 'var(--text-primary)'}}>Paid via Bank:</span>
                    <span style={{color: 'var(--text-primary)'}}>₹{paidViaBank.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3" style={{borderColor: 'var(--border)'}}>
                  <div className="flex justify-between">
                    <span style={{color: 'var(--text-primary)'}}>Amount Due:</span>
                    <span style={{color: 'var(--text-primary)'}}>₹{amountDue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{color: 'var(--text-muted)'}}>
                    <span>(Total - Payment)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerInvoice;
