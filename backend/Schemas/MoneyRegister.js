const mongoose = require("mongoose");

const moneyRegisterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  money_credited: { type: Number },
  catetories: { type: mongoose.Schema.Types.Mixed , default: {}}, 
  usage: { type: Number },
  balance: { type: Number },
});


const MoneyRegister = mongoose.model("MoneyRegister", moneyRegisterSchema);

module.exports = MoneyRegister;