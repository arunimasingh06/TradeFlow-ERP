const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(helmet());


const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});


app.use('/api/reports', require('./routes/reports'));
app.use('/api/auth', require('./routes/auth'));
// Master Data routes
app.use('/api/master/contacts', require('./routes/master.contacts'));
app.use('/api/master/products', require('./routes/master.products'));
app.use('/api/master/taxes', require('./routes/master.taxes'));
app.use('/api/master/coa', require('./routes/master.coa'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/vendor-bills', require('./routes/vendorBills'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/sales-orders', require('./routes/salesOrders'));
app.use('/api/customer-invoices', require('./routes/customerInvoices'));
app.use('/api/ledger', require('./routes/ledger'));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to OdooXNmit Backend API',
    version: '1.0.0',
    status: 'Active'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Default error
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
});

module.exports = app;