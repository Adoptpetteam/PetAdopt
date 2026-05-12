require('dotenv').config();

const PAYMENT_METHODS = {
  COD: 'cod',
  VNPAY: 'vnpay',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

const VNPAY_CONFIG = {
  TMN_CODE: process.env.VNPAY_TMN_CODE || 'DEMO1234',
  HASH_SECRET: process.env.VNPAY_HASH_SECRET || 'DEMOSECRETKEY12345678901234567890',
  URL: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  RETURN_URL: process.env.VNPAY_RETURN_URL || 'http://localhost:5000/api/orders/vnpay-return',
  API_URL: process.env.VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
};

module.exports = {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  VNPAY_CONFIG,
};