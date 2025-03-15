const mongoose = require("mongoose");

const activeInvestmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InvestmentPlan",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  start_date: {
    type: Date,
    default: Date.now,
  },
  last_calculated: {
    type: Date,
    default: Date.now,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },  
  daily_roi: {
    type: Number,
    required: true,
  },
});

const ActiveInvestment = mongoose.model("ActiveInvestment", activeInvestmentSchema);

module.exports = ActiveInvestment; 
