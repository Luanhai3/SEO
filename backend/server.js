const express = require('express');
const cors = require('cors');
const { SePayPgClient } = require('sepay-pg-node');
const { analyzeSEO } = require('./analyzer');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE GIẢ LẬP (Lưu trong RAM) ---
// Lưu ý: Dữ liệu sẽ mất khi Server khởi động lại (Deploy mới).
const transactions = [];

// --- LỊCH SỬ AUDIT (Lưu trong RAM) ---
const auditHistory = [];

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

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- CRON JOB: Gửi báo cáo hàng tuần (9:00 AM Thứ 2) ---
// Cú pháp Cron: Phút Giờ Ngày Tháng Thứ (0-6, 0 là CN)
cron.schedule('0 9 * * 1', async () => {
  console.log('⏳ Bắt đầu gửi báo cáo tuần...');
  
  // 1. Lấy danh sách email duy nhất từ lịch sử (RAM)
  // Lưu ý: Trong thực tế nên lấy từ Database thật
  const uniqueEmails = [...new Set(auditHistory.map(h => h.email))];

  for (const email of uniqueEmails) {
    // Lấy audit mới nhất của user này để gửi báo cáo
    const latestAudit = auditHistory
      .filter(h => h.email === email)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (!latestAudit) continue;

    // Nội dung email HTML
    const mailOptions = {
      from: '"SEO Audit Tool" <no-reply@seotool.com>',
      to: email,
      subject: `📊 Báo cáo SEO tuần này cho ${latestAudit.url}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Báo cáo SEO Định Kỳ</h2>
          <p>Xin chào,</p>
          <p>Dưới đây là trạng thái mới nhất của website <b>${latestAudit.url}</b>:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <div style="font-size: 48px; font-weight: bold; color: ${latestAudit.score >= 80 ? '#22c55e' : latestAudit.score >= 50 ? '#eab308' : '#ef4444'}">${latestAudit.score}/100</div>
            <div style="color: #6b7280;">Điểm số hiện tại</div>
          </div>

          <ul>
            <li>✅ <b>Đạt chuẩn:</b> ${latestAudit.summary.passed} tiêu chí</li>
            <li>⚠️ <b>Cảnh báo:</b> ${latestAudit.summary.warning} tiêu chí</li>
            <li>❌ <b>Nghiêm trọng:</b> ${latestAudit.summary.critical} tiêu chí</li>
          </ul>

          <p>Truy cập <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #2563eb; font-weight: bold;">SEO Audit Tool</a> để xem chi tiết và cách khắc phục.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #9ca3af;">Bạn nhận được email này vì đã sử dụng dịch vụ của chúng tôi.</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Đã gửi email cho ${email}`);
    } catch (error) {
      console.error(`❌ Lỗi gửi email cho ${email}:`, error);
    }
  }
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
  // Bảo mật bằng Admin Secret (Lấy từ biến môi trường)
  const adminSecret = process.env.ADMIN_SECRET;
  const clientSecret = req.headers['x-admin-secret'] || req.query.key;

  if (!adminSecret || clientSecret !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized: Sai hoặc thiếu Admin Key' });
  }
  
  res.json({ total: transactions.length, data: transactions });
});

// API kiểm tra trạng thái PRO của user
app.get('/api/check-pro/:userId', (req, res) => {
  const { userId } = req.params;
  // Kiểm tra xem có giao dịch nào chứa userId và đủ tiền không
  const isPro = transactions.some(t => 
    t.content && 
    t.content.includes(userId) && 
    t.amount >= 50000
  );
  res.json({ isPro });
});

// API lấy lịch sử audit của user
app.get('/api/history/:email', (req, res) => {
  const { email } = req.params;
  // Lấy 10 lần check gần nhất của email này
  const history = auditHistory
    .filter(h => h.email === email)
    .slice(-10); // Lấy 10 cái cuối
  res.json(history);
});

app.post('/api/analyze', async (req, res) => {
  const { url, email } = req.body;
  if (!url) return res.status(400).json({ error: 'Thiếu URL' });
  
  console.log('Analyzing:', url);
  const result = await analyzeSEO(url);
  
  if (result.error) return res.status(500).json(result);

  // Lưu lịch sử nếu có email
  if (email) {
    auditHistory.push({
      id: Date.now().toString(), // Thêm ID để định danh
      email,
      ...result, // Lưu toàn bộ kết quả (bao gồm audits, summary...)
      date: new Date()
    });
  }

  res.json(result);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
