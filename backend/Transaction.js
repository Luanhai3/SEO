const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  referenceCode: String,
  amount: Number,
  content: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);