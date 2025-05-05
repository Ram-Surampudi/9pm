const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  credit: { type: Number, default: 0 },
  debit: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  quantity: { type: String, default: "0" },
  category : { type: String, default: "usage" }
});

const recordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  balance: { type: Number, required: true },
  transactions: [transactionSchema]
});


const Records = mongoose.models.Records || mongoose.model("Records", recordSchema);

module.exports = Records;
