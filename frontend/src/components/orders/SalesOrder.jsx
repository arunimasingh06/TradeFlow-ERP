import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Check, Edit, Trash2, Plus, Minus, FileText, Printer, Send, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import CustomerInvoice from '../invoices/CustomerInvoice';

const SalesOrder = ({ onBack, onHome, salesOrder, mode }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    soNumber: salesOrder?.soNumber || (mode === 'new' ? '' : 'SO0001'),
    customerName: salesOrder?.customerName || (mode === 'new' ? '' : 'Dinesh Pathak'),
    reference: salesOrder?.reference || (mode === 'new' ? '' : 'REF-25-0001'),
    soDate: salesOrder?.soDate || (mode === 'new' ? new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  });

  const [products, setProducts] = useState(
    mode === 'new' ? [
      {
        id: 1,
        product: '',
        qty: 0,
        unitPrice: 0,
        untaxedAmount: 0,
        tax: '5%',
        taxAmount: 0,
        total: 0
      }
    ] : [
      {
        id: 1,
        product: 'Number',
        qty: 1,
        unitPrice: 0,
        untaxedAmount: 0,
        tax: '5%',
        taxAmount: 0,
        total: 0
      },
      {
        id: 2,
        product: 'Table',
        qty: 6,
        unitPrice: 3100,
        untaxedAmount: 18600,
        tax: '10%',
        taxAmount: 1860,
        total: 20460
      },
      {
        id: 3,
        product: 'Chair',
        qty: 3,
        unitPrice: 1000,
        untaxedAmount: 3000,
        tax: '5%',
        taxAmount: 150,
        total: 3150
      }
    ]
  );

  const [status, setStatus] = useState(salesOrder?.status || 'Draft');
  const [showCustomerInvoice, setShowCustomerInvoice] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductChange = (id, field, value) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        const updated = { ...product, [field]: value };
        
        // Recalculate amounts
        if (field === 'qty' || field === 'unitPrice') {
          updated.untaxedAmount = updated.qty * updated.unitPrice;
          const taxRate = parseFloat(updated.tax.replace('%', '')) / 100;
          updated.taxAmount = updated.untaxedAmount * taxRate;
          updated.total = updated.untaxedAmount + updated.taxAmount;
        }
        
        return updated;
      }
      return product;
    }));
  };

  const addProduct = () => {
    const newProduct = {
      id: products.length + 1,
      product: '',
      qty: 1,
      unitPrice: 0,
      untaxedAmount: 0,
      tax: '5%',
      taxAmount: 0,
      total: 0
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const calculateTotals = () => {
    const untaxedTotal = products.reduce((sum, product) => sum + product.untaxedAmount, 0);
    const taxTotal = products.reduce((sum, product) => sum + product.taxAmount, 0);
    const grandTotal = untaxedTotal + taxTotal;
    
    return { untaxedTotal, taxTotal, grandTotal };
  };

  const { untaxedTotal, taxTotal, grandTotal } = calculateTotals();

  // If showing customer invoice, render CustomerInvoice component
  if (showCustomerInvoice) {
    return (
      <CustomerInvoice
        onBack={() => setShowCustomerInvoice(false)}
        onHome={onHome}
        salesOrder={formData}
        products={products}
      />
    );
  }

  const handleConfirm = () => {
    setStatus('Confirmed');
    console.log('Sales Order confirmed');
    // Navigate to Customer Invoice after confirmation
    setShowCustomerInvoice(true);
  };

  const handlePrint = () => {
    console.log('Printing Sales Order');
  };

  const handleSend = () => {
    console.log('Sending Sales Order');
  };

  const handleCancel = () => {
    setStatus('Cancelled');
    console.log('Sales Order cancelled');
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
        { id: 'draft', label: 'Draft', icon: FileText, action: () => setStatus('Draft') },
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

  const getStatusColor = () => {
    switch (status) {
      case 'Draft': return 'var(--warning)';
      case 'Confirmed': return 'var(--success)';
      case 'Cancelled': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
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
              Sales Order
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* SO Number */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  SO No.
                </label>
                <input
                  type="text"
                  value={formData.soNumber}
                  onChange={(e) => handleInputChange('soNumber', e.target.value)}
                  placeholder="Enter SO Number (e.g., SO0001)"
                  className="w-full px-3 py-2 rounded-lg border bg-transparent"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)'
                  }}
                />
                <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                  (auto generate SO Number if not last order)
                </p>
              </div>

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
                  Alpha numeric (text)
                </p>
              </div>

              {/* SO Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  SO Date
                </label>
                <input
                  type="date"
                  value={formData.soDate}
                  onChange={(e) => handleInputChange('soDate', e.target.value)}
                  placeholder="Select SO date"
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
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Unit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Untaxed Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Tax</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Tax Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'var(--text-primary)'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id} className="border-b" style={{borderColor: 'var(--border)'}}>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>{index + 1}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={product.product}
                        onChange={(e) => handleProductChange(product.id, 'product', e.target.value)}
                        className="w-full px-2 py-1 rounded border bg-transparent text-sm"
                        style={{
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--surface)'
                        }}
                        placeholder="Product name"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={product.qty}
                        onChange={(e) => handleProductChange(product.id, 'qty', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 rounded border bg-transparent text-sm"
                        style={{
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--surface)'
                        }}
                        placeholder="Qty"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={product.unitPrice}
                        onChange={(e) => handleProductChange(product.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 rounded border bg-transparent text-sm"
                        style={{
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--surface)'
                        }}
                        placeholder="Price"
                      />
                    </td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>{product.untaxedAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={product.tax}
                        onChange={(e) => handleProductChange(product.id, 'tax', e.target.value)}
                        className="px-2 py-1 rounded border bg-transparent text-sm"
                        style={{
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--surface)'
                        }}
                      >
                        <option value="5%">5%</option>
                        <option value="10%">10%</option>
                        <option value="18%">18%</option>
                      </select>
                    </td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>{product.taxAmount.toFixed(2)}</td>
                    <td className="px-4 py-3" style={{color: 'var(--text-primary)'}}>{product.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-100"
                        style={{color: 'var(--error)'}}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Product Button */}
          <div className="p-4 border-b" style={{borderColor: 'var(--border)'}}>
            <button
              onClick={addProduct}
              className="flex items-center px-4 py-2 rounded-lg border-2 border-dashed transition-colors"
              style={{
                borderColor: 'var(--secondary)',
                color: 'var(--secondary)',
                backgroundColor: 'transparent'
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>

          {/* Totals */}
          <div className="p-6">
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span style={{color: 'var(--text-primary)'}}>Untaxed Amount:</span>
                  <span style={{color: 'var(--text-primary)'}}>₹{untaxedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{color: 'var(--text-primary)'}}>Tax:</span>
                  <span style={{color: 'var(--text-primary)'}}>₹{taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2" style={{borderColor: 'var(--border)'}}>
                  <span style={{color: 'var(--text-primary)'}}>Total:</span>
                  <span style={{color: 'var(--text-primary)'}}>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SalesOrder;
