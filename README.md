🧾 TradeFlow-ERP

A Cloud-Based Accounting and Inventory Management System

TradeFlow-ERP is a modular ERP solution designed to automate accounting, invoicing, and inventory workflows for small and medium-scale enterprises.
It connects every financial process — from sales and purchase orders to payments and reports — within a single, streamlined dashboard.


🚀 Features

🔐 Authentication & Roles
- Secure login and signup for Admins and Accountants
- Role-based data access and control
- Optional password recovery via OTP

📚 Master Data Management
- Contact Master: Manage customer and vendor profiles with complete details.
- Product Master: Store goods and services with prices, taxes, and HSN codes.
- Tax Master: Define and apply flexible tax rules.
- Chart of Accounts (CoA): Categorize ledgers under Assets, Liabilities, Income, Expenses, and Equity.

💼 Transaction Workflows
- Purchase Cycle: Create purchase orders → Convert to vendor bills → Record payments.
- Sales Cycle: Create sales orders → Generate invoices → Register payments (Cash/Bank).
- Inventory Sync: Stock updates automatically after each transaction.

📊 Reporting & Analytics
- Balance Sheet: Real-time overview of Assets, Liabilities, and Equity.
- Profit & Loss (P&L): Tracks revenue and expenses over time.
- Stock Report: Displays product quantity, valuation, and movement.
- Partner Ledger: Transaction history for each customer or vendor.


🧠 Tech Stack
Layer	        Technology
Frontend	React (JSX) + Tailwind CSS
Backend	        Node.js + Express.js
Database	MySQL
API Testing	Postman
Version Control	Git + GitHub


🏗️ System Architecture
React (JSX Frontend)

        ↓ REST APIs
        
Node.js + Express (Backend)

        ↓ SQL Queries / ORM
        
MySQL (Database)


📡 Core API Endpoints (Sample)
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	User authentication
POST	/api/contacts	Add customer/vendor
POST	/api/products	Add new product or service
POST	/api/sales-order	Create sales order
POST	/api/purchase-order	Create purchase order
GET	/api/reports/pnl	Generate Profit & Loss report
GET	/api/reports/balance-sheet	Generate Balance Sheet
🌟 Highlights

✅ Unified platform for accounting, inventory, and reporting
✅ Modular structure for scalability and clarity
✅ Real-time analytics and data synchronization
✅ Minimal manual entry — maximum automation
✅ Built for modern business digitization

📈 Future Enhancements

🧾 Exportable reports (PDF/Excel)

🔔 Smart payment and invoice reminders

🌍 Multi-currency and tax rule support

📱 Responsive mobile-friendly UI

🧠 AI-powered business insights

