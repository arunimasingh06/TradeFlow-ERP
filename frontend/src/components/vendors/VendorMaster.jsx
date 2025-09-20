import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Building2, Home, Check, Edit, Trash2 } from 'lucide-react';
import VendorForm from './VendorForm';
import { useAuth } from '../../hooks/useAuth';

const VendorMaster = ({ onBack, onHome }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formMode, setFormMode] = useState('new');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch vendors from backend
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/master/contacts?type=Vendor&limit=50', {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (!res.ok) throw new Error('Failed to load vendors');
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        // Map backend contact model to UI shape
        const mapped = items.map((c) => ({
          id: c._id || c.id,
          image: c.profileImage || '/api/placeholder/40/40',
          name: c.name,
          email: c.email,
          mobile: c.mobile || '',
          gstNo: c.gstNo || '-',
          address: c.address?.street || '',
          city: c.address?.city || '',
          state: c.address?.state || '',
          pincode: c.address?.pincode || ''
        }));
        setVendors(mapped);
      } catch (e) {
        console.error(e);
        setError('Unable to fetch vendors from server. Showing demo data.');
        // Fallback demo data (previous static list)
        setVendors([
          { id: 1, image: '/api/placeholder/40/40', name: 'ABC Suppliers Ltd', email: 'contact@abcsuppliers.com', mobile: '+91 9876543210', gstNo: '27ABCDE1234F1Z5', address: '123 Industrial Area', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
          { id: 2, image: '/api/placeholder/40/40', name: 'XYZ Trading Co', email: 'info@xyztrading.com', mobile: '+91 8765432109', gstNo: '29XYZAB5678G2H6', address: '456 Business Park', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
          { id: 3, image: '/api/placeholder/40/40', name: 'PQR Industries', email: 'sales@pqrindustries.com', mobile: '+91 7654321098', gstNo: '06PQRST9012I3J4', address: '789 Manufacturing Hub', city: 'Delhi', state: 'Delhi', pincode: '110001' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const handleVendorClick = (vendor) => {
    setSelectedVendor(vendor);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleNewVendor = () => {
    setSelectedVendor(null);
    setFormMode('new');
    setShowForm(true);
  };

  const handleBackFromForm = () => {
    setShowForm(false);
    setSelectedVendor(null);
  };

  const handleConfirm = () => {
    console.log('Confirming vendor operation');
    // Handle confirm logic here
  };

  const handleModify = () => {
    console.log('Modifying vendor');
    // Handle modify logic here
  };

  const handleDelete = () => {
    console.log('Deleting vendor');
    // Handle delete logic here
  };

  const getNavigationButtons = () => {
    if (user?.role === 'admin' || user?.role === 'accountant') {
      return [
        { id: 'new', label: 'New', icon: null, action: handleNewVendor },
        { id: 'confirm', label: 'Confirm', icon: Check, action: handleConfirm },
        { id: 'modify', label: 'Modify', icon: Edit, action: handleModify },
        { id: 'delete', label: 'Delete', icon: Trash2, action: handleDelete },
        { id: 'back', label: 'Back', icon: ArrowLeft, action: onBack }
      ];
    } else {
      return [
        { id: 'home', label: 'Home', icon: Home, action: onHome },
        { id: 'back', label: 'Back', icon: ArrowLeft, action: onBack }
      ];
    }
  };

  // If showing form, render VendorForm
  if (showForm) {
    return (
      <VendorForm
        onBack={handleBackFromForm}
        onHome={onHome}
        vendor={selectedVendor}
        mode={formMode}
      />
    );
  }

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
              <button
                onClick={onBack}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors mr-4"
                style={{
                  backgroundColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--border)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--border-light)'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Vendor Master
              </h1>
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
          {/* List View Header */}
          <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  List View
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {error || 'Manage your vendor information and details'}
                </p>
              </div>
              <motion.button
                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--primary)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onClick={handleNewVendor}
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </motion.button>
            </div>
          </div>

          {/* Vendor List */}
          <div className="p-6 space-y-3">
            {loading ? (
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading vendors...</div>
            ) : (
              vendors.map((vendor, index) => (
                <motion.button
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full p-4 rounded-xl border-2 transition-all duration-300 text-left group"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    boxShadow: '0 2px 8px var(--shadow)'
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 8px 24px var(--shadow)',
                    borderColor: 'var(--primary)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--border-light)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                  onClick={() => handleVendorClick(vendor)}
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - Vendor info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: 'var(--purple)' + '20',
                          border: `2px solid var(--purple)`
                        }}>
                        <Building2 className="w-6 h-6" style={{ color: 'var(--purple)' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors"
                          style={{ color: 'var(--text-primary)' }}>
                          {vendor.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {vendor.city ? `${vendor.city}, ${vendor.state}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Right side - Contact info */}
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {vendor.email}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {vendor.mobile}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorMaster;
