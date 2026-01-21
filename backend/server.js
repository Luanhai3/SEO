require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { SePayPgClient } = require('sepay-pg-node');
const { analyzeSEO } = require('./analyzer');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

/* =======================
   DATABASE GIẢ LẬP (RAM)
======================= */
const transactions = [];
const auditHistory = [];

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

  const uniqueEmails = [...new Set(auditHistory.map(h => h.email))];

  for (const email of uniqueEmails) {
    const latestAudit = auditHistory
      .filter(h => h.email === email)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

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

app.post('/api/sepay-webhook', (req, res) => {
  try {
    const apiKey = process.env.SEPAY_API_KEY || process.env.SEPAY_SECRET_KEY;
    const auth = req.headers.authorization;

    if (auth !== `Bearer ${apiKey}`) {
      return res.status(401).json({ success: false });
    }

    const { transferAmount, transferContent, referenceCode } = req.body;

    transactions.unshift({
      referenceCode,
      amount: transferAmount,
      content: transferContent,
      date: new Date().toISOString()
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
      auditHistory.push({
        id: Date.now().toString(),
        email,
        ...result,
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
app.post('/api/chat', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ reply: 'AI chưa được cấu hình.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // MODEL CHUẨN – KHÔNG 404
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro'
    });

    const result = await model.generateContent(req.body.message);
    const text = result.response.text();

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
