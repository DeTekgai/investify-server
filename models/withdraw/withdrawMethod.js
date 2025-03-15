const mongoose = require("mongoose");

const withdrawMethodSchema = new mongoose.Schema({
  withdrawal_name: {
    type: String,
    required: true,
  },
  withdraw_charge: {
    type: String,
    required: true,
  },
  isActive: {
    type: String,
    require: true,
    default: true,
  },
  min_withdraw_amount: {
    type: Number,
    required: true,
  },
  max_withdraw_amount: {
    type: Number,
    required: true,
  },
  withdraw_instruction: {
    type: String,
    required: false,
  },
});
const withdrawMethod = mongoose.model("withdrawMethods", withdrawMethodSchema);

module.exports = withdrawMethod;
