const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  email: { type: String, index: true },
  url: String,
  score: Number,
  summary: {
    passed: Number,
    warning: Number,
    critical: Number
  },
  audits: [{
    title: String,
    status: String,
    msg: String,
    fix: String,
    isPro: Boolean
  }],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);