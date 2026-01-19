const express = require('express');
const cors = require('cors');
const { SePayPgClient } = require('sepay-pg-node');
const { analyzeSEO } = require('./analyzer');

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE GIẢ LẬP (Lưu trong RAM) ---
// Lưu ý: Dữ liệu sẽ mất khi Server khởi động lại (Deploy mới).
const transactions = [];

// Route trang chủ để kiểm tra server sống hay chết
app.get('/', (req, res) => {
  res.send('✅ SEO Audit Backend is running!');
});

// Cấu hình Client (Lấy từ trang quản trị SePay)
const sepayClient = new SePayPgClient({
  env: process.env.SEPAY_ENV || 'sandbox',
  merchant_id: process.env.SEPAY_MERCHANT_ID,
  secret_key: process.env.SEPAY_SECRET_KEY
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

// API Webhook nhận thông báo giao dịch từ SePay
app.post('/api/sepay-webhook', (req, res) => {
  try {
    // --- BẢO MẬT: Xác thực Webhook ---
    // SePay gửi kèm header Authorization: Bearer <API_KEY>
    // Ta cần kiểm tra token này có khớp với key của mình không
    const sepayApiKey = process.env.SEPAY_API_KEY || process.env.SEPAY_SECRET_KEY;
    const authHeader = req.headers['authorization'];

    if (!authHeader || authHeader !== `Bearer ${sepayApiKey}`) {
      console.warn(`⚠️ Cảnh báo: Request không hợp lệ từ IP ${req.ip}`);
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // SePay gửi dữ liệu giao dịch qua body
    const { transferAmount, transferContent, referenceCode } = req.body;
    
    console.log(`💰 Webhook nhận tiền: ${transferAmount} VND - Nội dung: ${transferContent}`);

    // LƯU VÀO DATABASE GIẢ LẬP
    const newTransaction = {
      referenceCode,
      amount: transferAmount,
      content: transferContent,
      date: new Date().toLocaleString('vi-VN')
    };
    transactions.unshift(newTransaction); // Thêm vào đầu danh sách
    
    return res.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ success: false });
  }
});

// API xem danh sách giao dịch (Dùng để kiểm tra nhanh)
app.get('/api/transactions', (req, res) => {
  // Bảo mật bằng Admin Secret (Lấy từ biến môi trường hoặc mặc định 'admin123')
  const adminSecret = process.env.ADMIN_SECRET || 'admin123';
  const clientSecret = req.headers['x-admin-secret'] || req.query.key;

  if (clientSecret !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized: Sai hoặc thiếu Admin Key' });
  }
  
  res.json({ total: transactions.length, data: transactions });
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
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
