require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { SePayPgClient } = require('sepay-pg-node');
const { analyzeSEO } = require('./analyzer');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const AuditLog = require('./models/AuditLog');

const app = express();
app.set('trust proxy', 1); // Cần thiết khi deploy trên Render để nhận diện đúng IP
app.use(cors());
app.use(express.json());

/* =======================
   MONGODB CONNECTION
======================= */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

/* =======================
   HEALTH CHECK
======================= */
app.get('/', (req, res) => {
  res.send('✅ SEO Audit Backend is running!');
});

/* =======================
   SEPAY CONFIG
======================= */
const sepayClient = new SePayPgClient({
  env: process.env.SEPAY_ENV || 'sandbox',
  merchant_id: process.env.SEPAY_MERCHANT_ID,
  secret_key: process.env.SEPAY_SECRET_KEY
});

/* =======================
   EMAIL CONFIG
======================= */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* =======================
   CRON: WEEKLY REPORT
======================= */
cron.schedule('0 9 * * 1', async () => {
  console.log('⏳ Weekly SEO report cron started');

  const uniqueEmails = await AuditLog.distinct('email');

  for (const email of uniqueEmails) {
    const latestAudit = await AuditLog.findOne({ email }).sort({ date: -1 });

    if (!latestAudit) continue;

    try {
      await transporter.sendMail({
        from: '"SEO Audit Tool" <no-reply@seotool.com>',
        to: email,
        subject: `📊 Báo cáo SEO tuần này cho ${latestAudit.url}`,
        html: `
          <h2>Báo cáo SEO</h2>
          <p>Website: <b>${latestAudit.url}</b></p>
          <p>Điểm số: <b>${latestAudit.score}/100</b></p>
        `
      });

      console.log(`✅ Email sent to ${email}`);
    } catch (err) {
      console.error(`❌ Email error (${email}):`, err.message);
    }
  }
});

/* =======================
   PAYMENT APIs
======================= */
app.post('/api/create-payment', (req, res) => {
  const { amount, orderDescription } = req.body;

  const orderId = `DH-${Date.now()}`;

  const checkoutUrl = sepayClient.checkout.initCheckoutUrl();
  const checkoutFormfields =
    sepayClient.checkout.initOneTimePaymentFields({
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: orderId,
      order_amount: amount,
      currency: 'VND',
      order_description: orderDescription,
      success_url: `${process.env.FRONTEND_URL}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}?payment=cancel`,
      error_url: `${process.env.FRONTEND_URL}?payment=error`
    });

  res.json({ checkoutUrl, checkoutFormfields });
});

app.post('/api/sepay-webhook', async (req, res) => {
  try {
    const apiKey = process.env.SEPAY_API_KEY || process.env.SEPAY_SECRET_KEY;
    const auth = req.headers.authorization;

    if (auth !== `Bearer ${apiKey}`) {
      return res.status(401).json({ success: false });
    }

    const { transferAmount, transferContent, referenceCode } = req.body;

    await Transaction.create({
      referenceCode,
      amount: transferAmount,
      content: transferContent,
      date: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false });
  }
});

/* =======================
   ADMIN / USER APIs
======================= */
app.get('/api/transactions', (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(transactions);
});

app.get('/api/check-pro/:userId', (req, res) => {
  const isPro = transactions.some(
    t => t.content?.includes(req.params.userId) && t.amount >= 50000
  );
  res.json({ isPro });
});

app.get('/api/history/:email', (req, res) => {
  const history = auditHistory
    .filter(h => h.email === req.params.email)
    .slice(-10);
  res.json(history);
});

/* =======================
   SEO ANALYZE
======================= */
app.post('/api/analyze', async (req, res) => {
  try {
    const { url, email } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing URL' });

    const result = await analyzeSEO(url);
    if (result.error) return res.status(500).json(result);

    if (email) {
      await AuditLog.create({
        email,
        url: result.url,
        score: result.score,
        summary: result.summary,
        audits: result.audits,
        date: new Date()
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: 'Analyze failed' });
  }
});

/* =======================
   GEMINI CHATBOT (FIXED)
======================= */
// Rate Limiter: 10 requests per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { reply: "Bạn đang gửi tin nhắn quá nhanh. Vui lòng thử lại sau 1 phút." }
});

app.post('/api/chat', chatLimiter, async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ reply: 'AI chưa được cấu hình.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { message } = req.body;

    // Sử dụng model gemini-1.5-flash (nhanh và tiết kiệm chi phí)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    // Khởi tạo chat với ngữ cảnh (Persona)
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Bạn là trợ lý ảo chuyên gia về SEO (Search Engine Optimization) của 'SEO Audit Tool'. Hãy trả lời các câu hỏi về SEO, Marketing, và tối ưu website bằng tiếng Việt một cách chuyên nghiệp, ngắn gọn, dễ hiểu. Nếu câu hỏi không liên quan đến SEO hoặc Web, hãy từ chối khéo." }],
        },
        {
          role: "model",
          parts: [{ text: "Xin chào! Tôi là trợ lý AI của SEO Audit Tool. Tôi sẵn sàng giải đáp mọi thắc mắc về tối ưu hóa website và thứ hạng tìm kiếm của bạn." }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error('Gemini Error:', err.message);
    res.json({
      reply: 'AI đang quá tải hoặc lỗi kết nối. Bạn thử lại sau nhé.'
    });
  }
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
