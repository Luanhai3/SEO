const express = require('express');
const cors = require('cors');
const { SePayPgClient } = require('sepay-pg-node');
const { analyzeSEO } = require('./analyzer');

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình Client (Lấy từ trang quản trị SePay)
const sepayClient = new SePayPgClient({
  env: process.env.SEPAY_ENV || 'sandbox',
  merchant_id: process.env.SEPAY_MERCHANT_ID || 'YOUR_MERCHANT_ID',
  secret_key: process.env.SEPAY_SECRET_KEY || 'YOUR_MERCHANT_SECRET_KEY'
});

// API tạo giao dịch thanh toán
app.post('/api/create-payment', (req, res) => {
  const { amount, orderDescription } = req.body;
  
  // Tạo mã đơn hàng duy nhất
  const orderId = `DH-${Date.now()}`; 

  const checkoutURL = sepayClient.checkout.initCheckoutUrl();
  
  const checkoutFormfields = sepayClient.checkout.initOneTimePaymentFields({
    payment_method: 'BANK_TRANSFER', // Hoặc 'ATM_CARD', 'CREDIT_CARD'
    order_invoice_number: orderId,
    order_amount: amount,
    currency: 'VND',
    order_description: orderDescription,
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?payment=success`,
    error_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?payment=error`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?payment=cancel`,
  });

  // Trả về cho Frontend để render form
  res.json({ checkoutUrl: checkoutURL, checkoutFormfields });
});

app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Thiếu URL' });
  
  console.log('Analyzing:', url);
  const result = await analyzeSEO(url);
  
  if (result.error) return res.status(500).json(result);
  res.json(result);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));