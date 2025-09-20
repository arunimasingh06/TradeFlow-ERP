export const mockUser = {
  id: '1',
  name: 'Shiv Kumar',
  email: 'shiv@example.com',
  role: 'admin',
  avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  companyId: 'comp1'
};

export const mockContacts = [
  {
    id: '1',
    name: 'ABC Suppliers Ltd.',
    email: 'contact@abcsuppliers.com',
    phone: '+91 98765 43210',
    type: 'vendor',
    address: '123 Business Park, Mumbai, Maharashtra 400001',
    gstNumber: '27AABCA1234A1Z5',
    openingBalance: 50000,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'XYZ Retail Corp.',
    email: 'sales@xyzretail.com',
    phone: '+91 87654 32109',
    type: 'customer',
    address: '456 Commercial Street, Delhi, Delhi 110001',
    gstNumber: '07BBFCA2345B2Z6',
    openingBalance: -25000,
    createdAt: '2024-01-20T14:30:00Z'
  }
];

export const mockProducts = [
  {
    id: '1',
    name: 'Laptop Computer',
    description: 'High-performance business laptop',
    type: 'goods',
    salesPrice: 75000,
    purchasePrice: 60000,
    salesTaxId: '1',
    purchaseTaxId: '1',
    stockQuantity: 25,
    unit: 'piece',
    createdAt: '2024-01-10T09:00:00Z'
  },
  {
    id: '2',
    name: 'Software License',
    description: 'Annual software license',
    type: 'services',
    salesPrice: 12000,
    purchasePrice: 8000,
    salesTaxId: '2',
    purchaseTaxId: '2',
    stockQuantity: 0,
    unit: 'license',
    createdAt: '2024-01-12T11:15:00Z'
  }
];

export const mockTaxes = [
  { id: '1', name: 'GST 18%', rate: 18, type: 'percentage', applicableOn: 'both', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'GST 12%', rate: 12, type: 'percentage', applicableOn: 'both', createdAt: '2024-01-01T00:00:00Z' }
];

export const mockChartOfAccounts = [
  { id: '1', name: 'Cash in Hand', code: '1001', type: 'assets', subType: 'current_assets', openingBalance: 100000, currentBalance: 125000, createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Bank Account - SBI', code: '1002', type: 'assets', subType: 'current_assets', openingBalance: 500000, currentBalance: 750000, createdAt: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'Sales Revenue', code: '4001', type: 'income', subType: 'operating_income', openingBalance: 0, currentBalance: 2500000, createdAt: '2024-01-01T00:00:00Z' }
];

export const mockTransactions = [
  {
    id: '1',
    description: 'Website Development Invoice',
    customer: 'Tech Solutions Ltd.',
    amount: 125000,
    type: 'invoice',
    status: 'paid',
    date: '2024-01-15'
  },
  {
    id: '2',
    description: 'Office Supplies Purchase',
    customer: 'Office Mart',
    amount: 15000,
    type: 'purchase',
    status: 'paid',
    date: '2024-01-14'
  },
  {
    id: '3',
    description: 'Software License Payment',
    customer: 'Adobe Systems',
    amount: 45000,
    type: 'payment',
    status: 'pending',
    date: '2024-01-13'
  },
  {
    id: '4',
    description: 'Consulting Services Invoice',
    customer: 'StartupXYZ',
    amount: 85000,
    type: 'invoice',
    status: 'overdue',
    date: '2024-01-12'
  },
  {
    id: '5',
    description: 'Marketing Campaign Payment',
    customer: 'Google Ads',
    amount: 25000,
    type: 'payment',
    status: 'paid',
    date: '2024-01-11'
  },
  {
    id: '6',
    description: 'Equipment Purchase',
    customer: 'TechMart India',
    amount: 75000,
    type: 'purchase',
    status: 'paid',
    date: '2024-01-10'
  },
  {
    id: '7',
    description: 'Mobile App Development',
    customer: 'Digital Innovations',
    amount: 200000,
    type: 'invoice',
    status: 'draft',
    date: '2024-01-09'
  },
  {
    id: '8',
    description: 'Cloud Hosting Payment',
    customer: 'AWS',
    amount: 12000,
    type: 'payment',
    status: 'paid',
    date: '2024-01-08'
  }
];

export const mockDashboardStats = {
  totalSales: 2500000,
  totalPurchases: 1800000,
  cashInHand: 125000,
  bankBalance: 750000,
  totalStock: 1200000,
  overdueInvoices: 3
};

export const mockTimeBasedStats = {
  totalInvoice: { last24Hours: 0, last7Days: 23610, last30Days: 23610, change24h: 0, change7d: 0 },
  totalPurchase: { last24Hours: 0, last7Days: 17857, last30Days: 17857, change24h: 0, change7d: -83.33 },
  totalPayment: { last24Hours: 0, last7Days: 5752, last30Days: 5752, change24h: 0, change7d: -80.0 }
};

export const mockSalesData = [
  { month: 'Jan', sales: 400000, purchases: 300000 },
  { month: 'Feb', sales: 500000, purchases: 350000 },
  { month: 'Mar', sales: 450000, purchases: 320000 },
  { month: 'Apr', sales: 600000, purchases: 400000 },
  { month: 'May', sales: 550000, purchases: 380000 },
  { month: 'Jun', sales: 700000, purchases: 450000 }
];
